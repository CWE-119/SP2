import re
import os
import shutil
import datetime
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import webbrowser
from urllib.request import urlopen, Request
from io import BytesIO
import subprocess
import json

# Optional imports for GitHub Actions
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

try:
    import keyring
    KEYRING_AVAILABLE = True
except ImportError:
    KEYRING_AVAILABLE = False

# Requires: pip install pillow
from PIL import Image, ImageTk


# ----------------------------
# File parsing / writing helpers
# ----------------------------

def make_backup(path: str) -> str:
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{path}.bak_{ts}"
    shutil.copy2(path, backup_path)
    return backup_path


def read_text(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def write_text(path: str, content: str) -> None:
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def looks_like_link(s: str) -> bool:
    s = s.strip()
    if not s:
        return False
    if s.startswith("http://") or s.startswith("https://"):
        return True
    if re.search(r"\.(jpg|jpeg|png|webp|gif|mp4|mov|m4v|webm)$", s, re.IGNORECASE):
        return True
    return False


def looks_like_image_link(s: str) -> bool:
    s = s.strip().lower()
    if not (s.startswith("http://") or s.startswith("https://")):
        return False
    return bool(re.search(r"\.(jpg|jpeg|png|webp|gif)(\?.*)?$", s, re.IGNORECASE))


# ----------------------------
# imageLinks.js handling
# ----------------------------

_IMAGE_LINKS_RE = re.compile(
    r"(export\s+const\s+imageLinks\s*=\s*\[)(.*?)(\]\s*;)",
    re.DOTALL
)

def parse_image_links(js_text: str) -> list[str]:
    m = _IMAGE_LINKS_RE.search(js_text)
    if not m:
        return []
    body = m.group(2)
    return re.findall(r'["\'](.*?)["\']', body)


def add_many_image_links_file(image_links_path: str, new_links: list[str], allow_duplicates: bool) -> tuple[bool, str]:
    js = read_text(image_links_path)
    m = _IMAGE_LINKS_RE.search(js)
    if not m:
        return False, "Could not find: export const imageLinks = [ ... ];"

    existing = parse_image_links(js)
    existing_set = set(existing)

    prefix, body, suffix = m.group(1), m.group(2), m.group(3)

    indent = "  "
    body_out = body.rstrip()
    has_existing = len(existing) > 0 and body.strip() != ""

    added = skipped = invalid = 0

    cleaned = []
    seen_in_input = set()
    for l in new_links:
        l = l.strip()
        if not looks_like_link(l):
            invalid += 1
            continue
        if l in seen_in_input:
            skipped += 1
            continue
        seen_in_input.add(l)
        cleaned.append(l)

    to_add = []
    for l in cleaned:
        if (l in existing_set) and (not allow_duplicates):
            skipped += 1
        else:
            to_add.append(l)

    if not to_add:
        return False, f"Nothing to add. Skipped={skipped}, Invalid={invalid}"

    if not has_existing:
        lines = [f'{indent}"{l}"' for l in to_add]
        body_out = "\n" + "\n".join(lines) + "\n"
        added = len(to_add)
    else:
        if re.search(r",\s*$", body_out) is None:
            body_out += ","
        append_lines = [f'{indent}"{l}"' for l in to_add]
        body_out = body_out.rstrip() + "\n" + ",\n".join(append_lines) + "\n"
        added = len(to_add)

    new_js = js[:m.start()] + prefix + body_out + suffix + js[m.end():]
    backup = make_backup(image_links_path)
    write_text(image_links_path, new_js)
    return True, f"Added={added}, Skipped={skipped}, Invalid={invalid} (backup: {os.path.basename(backup)})"


# ----------------------------
# project.js handling (mediaData array)
# ----------------------------

_MEDIA_DATA_RE = re.compile(
    r"(const\s+mediaData\s*=\s*\[)(.*?)(\]\s*;)",
    re.DOTALL
)

def parse_project_media_items(js_text: str) -> list[dict]:
    m = _MEDIA_DATA_RE.search(js_text)
    if not m:
        return []
    body = m.group(2)
    obj_blocks = re.findall(r"\{.*?\}", body, flags=re.DOTALL)

    items = []
    for block in obj_blocks:
        link_m = re.search(r'link\s*:\s*["\']([^"\']+)["\']', block)
        type_m = re.search(r'type\s*:\s*["\']([^"\']+)["\']', block)
        mt_m = re.search(r'mediaType\s*:\s*["\']([^"\']+)["\']', block)
        if link_m and type_m and mt_m:
            items.append({"link": link_m.group(1), "type": type_m.group(1), "mediaType": mt_m.group(1)})
    return items


def build_media_object(link: str, typ: str, media_type: str, indent: str = "\t\t") -> str:
    return (
        f"{indent}{{\n"
        f'{indent}\tlink: "{link}",\n'
        f'{indent}\ttype: "{typ}",\n'
        f'{indent}\tmediaType: "{media_type}",\n'
        f"{indent}}}"
    )


def add_many_project_media_file(project_js_path: str, links: list[str], typ: str, media_type: str, allow_duplicates: bool) -> tuple[bool, str]:
    js = read_text(project_js_path)
    m = _MEDIA_DATA_RE.search(js)
    if not m:
        return False, "Could not find: const mediaData = [ ... ];"

    items = parse_project_media_items(js)
    existing_set = set([it["link"] for it in items])

    prefix, body, suffix = m.group(1), m.group(2), m.group(3)

    indent = "\t\t"
    indent_match = re.search(r"\n([ \t]+)\{", body)
    if indent_match:
        indent = indent_match.group(1)

    body_out = body.rstrip()
    has_existing_obj = bool(re.search(r"\{", body_out))

    added = skipped = invalid = 0

    cleaned = []
    seen_in_input = set()
    for l in links:
        l = l.strip()
        if not looks_like_link(l):
            invalid += 1
            continue
        if l in seen_in_input:
            skipped += 1
            continue
        seen_in_input.add(l)
        cleaned.append(l)

    to_add = []
    for l in cleaned:
        if (l in existing_set) and (not allow_duplicates):
            skipped += 1
        else:
            to_add.append(l)

    if not to_add:
        return False, f"Nothing to add. Skipped={skipped}, Invalid={invalid}"

    new_blocks = [build_media_object(l, typ, media_type, indent=indent) for l in to_add]

    if not has_existing_obj:
        body_out = "\n" + (",\n".join(new_blocks)) + "\n"
        added = len(to_add)
    else:
        if re.search(r",\s*$", body_out) is None:
            body_out += ","
        body_out = body_out.rstrip() + "\n" + (",\n".join(new_blocks)) + "\n"
        added = len(to_add)

    new_js = js[:m.start()] + prefix + body_out + suffix + js[m.end():]
    backup = make_backup(project_js_path)
    write_text(project_js_path, new_js)
    return True, f"Added={added}, Skipped={skipped}, Invalid={invalid} (backup: {os.path.basename(backup)})"


# ----------------------------
# UI
# ----------------------------

class LinkManagerApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("JS Link Manager (Bulk Add + Preview)")
        self.geometry("1180x740")

        self.image_links_path = tk.StringVar(value="imageLinks.js")
        self.project_js_path = tk.StringVar(value="project.js")

        self.mode = tk.StringVar(value="featured")
        self.allow_duplicates = tk.BooleanVar(value=False)

        self.type_var = tk.StringVar(value="1")
        self.media_type_var = tk.StringVar(value="image")

        self._preview_cache = {}  # url -> PhotoImage
        self._current_preview_photo = None

        self._build_ui()
        self.refresh_previews()
        self.git_refresh_status()

    def _build_ui(self):
        files_frame = ttk.LabelFrame(self, text="Files")
        files_frame.pack(fill="x", padx=12, pady=10)

        ttk.Label(files_frame, text="imageLinks.js:").grid(row=0, column=0, sticky="w", padx=8, pady=6)
        ttk.Entry(files_frame, textvariable=self.image_links_path, width=75).grid(row=0, column=1, sticky="we", padx=8, pady=6)
        ttk.Button(files_frame, text="Browse", command=self.browse_image_links).grid(row=0, column=2, padx=8, pady=6)

        ttk.Label(files_frame, text="project.js:").grid(row=1, column=0, sticky="w", padx=8, pady=6)
        ttk.Entry(files_frame, textvariable=self.project_js_path, width=75).grid(row=1, column=1, sticky="we", padx=8, pady=6)
        ttk.Button(files_frame, text="Browse", command=self.browse_project_js).grid(row=1, column=2, padx=8, pady=6)

        files_frame.columnconfigure(1, weight=1)

        form_frame = ttk.LabelFrame(self, text="Bulk Add Links (one per line)")
        form_frame.pack(fill="x", padx=12, pady=6)

        mode_row = ttk.Frame(form_frame)
        mode_row.pack(fill="x", padx=8, pady=6)

        ttk.Radiobutton(mode_row, text="Featured Image → imageLinks.js",
                        variable=self.mode, value="featured",
                        command=self.update_mode_ui).pack(side="left", padx=6)

        ttk.Radiobutton(mode_row, text="Project Media → project.js",
                        variable=self.mode, value="project",
                        command=self.update_mode_ui).pack(side="left", padx=6)

        ttk.Checkbutton(mode_row, text="Allow duplicates", variable=self.allow_duplicates).pack(side="left", padx=16)

        text_row = ttk.Frame(form_frame)
        text_row.pack(fill="both", padx=8, pady=6)

        self.links_text = tk.Text(text_row, height=6, wrap="word")
        self.links_text.pack(side="left", fill="both", expand=True)

        scroll = ttk.Scrollbar(text_row, command=self.links_text.yview)
        scroll.pack(side="right", fill="y")
        self.links_text.configure(yscrollcommand=scroll.set)

        # when you select text/caret line, update preview
        self.links_text.bind("<ButtonRelease-1>", self.preview_from_current_line)
        self.links_text.bind("<KeyRelease>", self.preview_from_current_line)

        options_row = ttk.Frame(form_frame)
        options_row.pack(fill="x", padx=8, pady=6)

        ttk.Label(options_row, text="Type:").pack(side="left", padx=6)
        self.type_entry = ttk.Entry(options_row, textvariable=self.type_var, width=10)
        self.type_entry.pack(side="left", padx=6)

        ttk.Label(options_row, text="MediaType:").pack(side="left", padx=6)
        self.media_type_menu = ttk.Combobox(
            options_row,
            textvariable=self.media_type_var,
            values=["image", "video", "youtube", "short"],
            state="readonly",
            width=12
        )
        self.media_type_menu.pack(side="left", padx=6)

        ttk.Button(options_row, text="Add All", command=self.add_all).pack(side="right", padx=6)
        ttk.Button(options_row, text="Refresh Preview", command=self.refresh_previews).pack(side="right", padx=6)
        ttk.Button(options_row, text="Open first link", command=self.open_first_link).pack(side="right", padx=6)

        # ----------------------------
        # Git Panel
        # ----------------------------
        git_frame = ttk.LabelFrame(self, text="Git")
        git_frame.pack(fill="x", padx=12, pady=6)

        row1 = ttk.Frame(git_frame)
        row1.pack(fill="x", padx=8, pady=6)

        self.auto_commit_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(row1, text="Auto-commit", variable=self.auto_commit_var).pack(side="left", padx=6)

        ttk.Label(row1, text="Commit message:").pack(side="left", padx=6)
        self.commit_msg_var = tk.StringVar(value="Update media links via JS Link Manager")
        ttk.Entry(row1, textvariable=self.commit_msg_var, width=55).pack(side="left", padx=6, fill="x", expand=True)

        row2 = ttk.Frame(git_frame)
        row2.pack(fill="x", padx=8, pady=6)

        ttk.Label(row2, text="Branch:").pack(side="left", padx=6)
        self.branch_var = tk.StringVar(value="")
        self.branch_combo = ttk.Combobox(row2, textvariable=self.branch_var, state="readonly", width=22)
        self.branch_combo.pack(side="left", padx=6)
        ttk.Button(row2, text="Checkout", command=self.git_checkout_selected_branch).pack(side="left", padx=6)

        # Status indicator (Canvas dot + text)
        self.git_status_canvas = tk.Canvas(row2, width=16, height=16, highlightthickness=0)
        self.git_status_canvas.pack(side="left", padx=(18, 6))
        self.git_status_dot = self.git_status_canvas.create_oval(2, 2, 14, 14, fill="gray", outline="")

        self.git_status_text = tk.StringVar(value="Git status: unknown")
        ttk.Label(row2, textvariable=self.git_status_text).pack(side="left", padx=6)

        ttk.Button(row2, text="Refresh Status", command=self.git_refresh_status).pack(side="right", padx=6)
        ttk.Button(row2, text="Git Push", command=self.git_push).pack(side="right", padx=6)

        row3 = ttk.Frame(git_frame)
        row3.pack(fill="x", padx=8, pady=(0, 8))

        ttk.Label(row3, text="Actions workflow file (optional):").pack(side="left", padx=6)
        self.gh_workflow_var = tk.StringVar(value="")  # e.g. "deploy.yml"
        ttk.Entry(row3, textvariable=self.gh_workflow_var, width=28).pack(side="left", padx=6)

        ttk.Label(row3, text="Ref:").pack(side="left", padx=6)
        self.gh_ref_var = tk.StringVar(value="")  # defaults to selected branch
        ttk.Entry(row3, textvariable=self.gh_ref_var, width=18).pack(side="left", padx=6)

        self.actions_btn = ttk.Button(row3, text="Trigger GitHub Actions", command=self.github_trigger_actions)
        self.actions_btn.pack(side="right", padx=6)

        # Enable/disable Actions button based on requests availability
        if not REQUESTS_AVAILABLE:
            self.actions_btn.state(["disabled"])
            self.actions_btn.config(text="Trigger GitHub Actions (needs requests)")

        preview_frame = ttk.LabelFrame(self, text="Preview (Current contents + Image Preview)")
        preview_frame.pack(fill="both", expand=True, padx=12, pady=10)

        panes = ttk.Panedwindow(preview_frame, orient="horizontal")
        panes.pack(fill="both", expand=True, padx=8, pady=8)

        left = ttk.Frame(panes)
        panes.add(left, weight=1)
        ttk.Label(left, text="imageLinks.js (featured)").pack(anchor="w")
        self.image_list = tk.Listbox(left, height=18)
        self.image_list.pack(fill="both", expand=True, pady=6)
        self.image_list.bind("<<ListboxSelect>>", self.preview_from_image_list)

        mid = ttk.Frame(panes)
        panes.add(mid, weight=1)
        ttk.Label(mid, text="project.js (mediaData)").pack(anchor="w")
        self.project_list = tk.Listbox(mid, height=18)
        self.project_list.pack(fill="both", expand=True, pady=6)
        self.project_list.bind("<<ListboxSelect>>", self.preview_from_project_list)

        right = ttk.Frame(panes)
        panes.add(right, weight=1)
        ttk.Label(right, text="Image Preview").pack(anchor="w")

        self.preview_label = ttk.Label(right, text="Select a link to preview", anchor="center")
        self.preview_label.pack(fill="both", expand=True, padx=8, pady=8)

        self.update_mode_ui()

    # ---------- Git Methods ----------

    def _repo_path(self) -> str:
        # Use folder of project.js (works if your script edits files inside repo)
        p = self.project_js_path.get().strip()
        if p:
            return os.path.dirname(os.path.abspath(p))
        return os.getcwd()

    def _run_git(self, args: list[str], cwd: str):
        return subprocess.run(["git"] + args, cwd=cwd, text=True, capture_output=True)

    def _set_git_dot(self, color: str):
        self.git_status_canvas.itemconfig(self.git_status_dot, fill=color)

    def git_refresh_status(self):
        repo = self._repo_path()

        if not os.path.isdir(os.path.join(repo, ".git")):
            self._set_git_dot("red")
            self.git_status_text.set("Git status: not a git repo (.git missing)")
            self.branch_combo["values"] = []
            self.branch_var.set("")
            return

        # Current branch
        cur = self._run_git(["branch", "--show-current"], repo)
        if cur.returncode != 0:
            self._set_git_dot("red")
            self.git_status_text.set(f"Git error: {cur.stderr.strip()}")
            return
        current_branch = cur.stdout.strip()

        # List local branches
        br = self._run_git(["branch", "--format=%(refname:short)"], repo)
        branches = [b.strip() for b in br.stdout.splitlines() if b.strip()] if br.returncode == 0 else []
        self.branch_combo["values"] = branches
        if current_branch:
            self.branch_var.set(current_branch)

        # Working tree changes?
        dirty = self._run_git(["status", "--porcelain"], repo)
        if dirty.returncode != 0:
            self._set_git_dot("red")
            self.git_status_text.set(f"Git error: {dirty.stderr.strip()}")
            return
        has_changes = bool(dirty.stdout.strip())

        # Ahead/behind vs upstream
        # If no upstream configured, this command errors.
        ab = self._run_git(["rev-list", "--left-right", "--count", "HEAD...@{u}"], repo)
        ahead = behind = None
        if ab.returncode == 0:
            # output: "<ahead> <behind>"
            parts = ab.stdout.strip().split()
            if len(parts) == 2:
                ahead, behind = int(parts[0]), int(parts[1])

        # Decide status
        if has_changes:
            self._set_git_dot("orange")
            msg = "Git status: changes not committed"
        else:
            msg = "Git status: clean"

        if ahead is not None and behind is not None:
            msg += f" | ahead {ahead}, behind {behind}"
            if behind > 0:
                self._set_git_dot("orange")
            elif ahead > 0 and not has_changes:
                self._set_git_dot("orange")
            elif not has_changes:
                self._set_git_dot("green")
        else:
            # No upstream info; still show clean/dirty
            if not has_changes:
                self._set_git_dot("green")

        self.git_status_text.set(msg)

    def git_checkout_selected_branch(self):
        repo = self._repo_path()
        branch = self.branch_var.get().strip()
        if not branch:
            messagebox.showwarning("Checkout", "Select a branch first.")
            return

        # If working tree dirty, warn
        dirty = self._run_git(["status", "--porcelain"], repo)
        if dirty.returncode == 0 and dirty.stdout.strip():
            if not messagebox.askyesno("Uncommitted changes", "You have uncommitted changes. Checkout anyway?"):
                return

        co = self._run_git(["checkout", branch], repo)
        if co.returncode != 0:
            messagebox.showerror("Checkout failed", co.stderr.strip() or co.stdout.strip())
            return

        self.git_refresh_status()
        messagebox.showinfo("Checkout", f"Checked out branch: {branch}")

    def git_push(self):
        repo = self._repo_path()

        if not os.path.isdir(os.path.join(repo, ".git")):
            messagebox.showerror("Git Push", f"Not a git repository:\n{repo}")
            return

        # Refresh status first (also updates branches)
        self.git_refresh_status()

        # Auto-commit logic
        if self.auto_commit_var.get():
            status = self._run_git(["status", "--porcelain"], repo)
            if status.returncode != 0:
                messagebox.showerror("Git error", status.stderr.strip())
                return

            if status.stdout.strip():
                add = self._run_git(["add", "."], repo)
                if add.returncode != 0:
                    messagebox.showerror("Git add failed", add.stderr.strip())
                    return

                msg = self.commit_msg_var.get().strip() or "Update via JS Link Manager"
                commit = self._run_git(["commit", "-m", msg], repo)
                if commit.returncode != 0:
                    # If nothing staged, allow
                    if "nothing to commit" not in (commit.stderr.lower() + commit.stdout.lower()):
                        messagebox.showerror("Git commit failed", (commit.stderr or commit.stdout).strip())
                        return

        # Push
        # NOTE: If auth is missing, Git itself will prompt (credential manager / terminal / popup).
        push = self._run_git(["push"], repo)
        if push.returncode == 0:
            self.git_refresh_status()
            messagebox.showinfo("Git Push", "✅ Push successful.")
        else:
            self.git_refresh_status()
            messagebox.showwarning(
                "Git Push",
                "Push failed or needs authentication.\n\n"
                "Git output:\n"
                f"{(push.stderr or push.stdout).strip()}"
            )

    # ---------- GitHub Actions Triggers ----------

    def _get_remote_url(self, repo: str) -> str | None:
        r = self._run_git(["remote", "get-url", "origin"], repo)
        if r.returncode != 0:
            return None
        return r.stdout.strip()

    def _parse_github_owner_repo(self, remote_url: str):
        # Supports:
        # https://github.com/OWNER/REPO.git
        # git@github.com:OWNER/REPO.git
        m = re.search(r"github\.com[/:]([^/]+)/([^/]+?)(?:\.git)?$", remote_url)
        if not m:
            return None, None
        return m.group(1), m.group(2)

    def _get_github_token(self, owner_repo_key: str) -> str | None:
        # Prefer keyring (secure). Fallback: prompt each time.
        if KEYRING_AVAILABLE:
            tok = keyring.get_password("js_link_manager_github", owner_repo_key)
            if tok:
                return tok

        tok = tk.simpledialog.askstring(
            "GitHub Token",
            "Enter GitHub Personal Access Token (PAT)\n"
            "(needs repo + workflow permissions).",
            show="*"
        )
        if not tok:
            return None

        if KEYRING_AVAILABLE:
            # store securely for next time
            keyring.set_password("js_link_manager_github", owner_repo_key, tok)

        return tok

    def github_trigger_actions(self):
        if not REQUESTS_AVAILABLE:
            messagebox.showerror("GitHub Actions", "requests not installed. Run: pip install requests")
            return

        repo = self._repo_path()
        if not os.path.isdir(os.path.join(repo, ".git")):
            messagebox.showerror("GitHub Actions", f"Not a git repository:\n{repo}")
            return

        workflow = self.gh_workflow_var.get().strip()
        if not workflow:
            messagebox.showwarning("GitHub Actions", "Enter workflow file name, e.g. deploy.yml")
            return

        remote = self._get_remote_url(repo)
        if not remote:
            messagebox.showerror("GitHub Actions", "No origin remote found.")
            return

        owner, repo_name = self._parse_github_owner_repo(remote)
        if not owner or not repo_name:
            messagebox.showerror("GitHub Actions", f"Origin is not a GitHub repo:\n{remote}")
            return

        # ref defaults to selected branch
        ref = self.gh_ref_var.get().strip() or self.branch_var.get().strip() or "main"

        key = f"{owner}/{repo_name}"
        token = self._get_github_token(key)
        if not token:
            return

        url = f"https://api.github.com/repos/{owner}/{repo_name}/actions/workflows/{workflow}/dispatches"
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        payload = {"ref": ref}

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=15)
            if resp.status_code in (204, 201):
                messagebox.showinfo("GitHub Actions", f"✅ Triggered workflow '{workflow}' on ref '{ref}'.")
            else:
                messagebox.showerror(
                    "GitHub Actions",
                    f"Failed ({resp.status_code}).\n\n{resp.text}"
                )
        except Exception as ex:
            messagebox.showerror("GitHub Actions", str(ex))

    # ---------- Existing UI Methods ----------

    def update_mode_ui(self):
        is_project = (self.mode.get() == "project")
        state = "normal" if is_project else "disabled"
        self.type_entry.configure(state=state)
        self.media_type_menu.configure(state="readonly" if is_project else "disabled")

    def browse_image_links(self):
        path = filedialog.askopenfilename(title="Select imageLinks.js", filetypes=[("JavaScript", "*.js"), ("All files", "*.*")])
        if path:
            self.image_links_path.set(path)
            self.refresh_previews()

    def browse_project_js(self):
        path = filedialog.askopenfilename(title="Select project.js", filetypes=[("JavaScript", "*.js"), ("All files", "*.*")])
        if path:
            self.project_js_path.set(path)
            self.refresh_previews()

    def get_links_from_textbox(self) -> list[str]:
        raw = self.links_text.get("1.0", "end").strip()
        if not raw:
            return []
        return [ln.strip() for ln in raw.splitlines() if ln.strip()]

    def open_first_link(self):
        links = self.get_links_from_textbox()
        if not links:
            messagebox.showinfo("Preview", "Paste at least one link first.")
            return
        webbrowser.open(links[0])

    def refresh_previews(self):
        self.image_list.delete(0, tk.END)
        img_path = self.image_links_path.get().strip()
        if os.path.exists(img_path):
            try:
                js = read_text(img_path)
                links = parse_image_links(js)
                for l in links:
                    self.image_list.insert(tk.END, l)
            except Exception as ex:
                self.image_list.insert(tk.END, f"[Error reading file] {ex}")
        else:
            self.image_list.insert(tk.END, "[File not found]")

        self.project_list.delete(0, tk.END)
        prj_path = self.project_js_path.get().strip()
        if os.path.exists(prj_path):
            try:
                js = read_text(prj_path)
                items = parse_project_media_items(js)
                for it in items:
                    self.project_list.insert(tk.END, f'{it["mediaType"]} | type={it["type"]} | {it["link"]}')
            except Exception as ex:
                self.project_list.insert(tk.END, f"[Error reading file] {ex}")
        else:
            self.project_list.insert(tk.END, "[File not found]")

    # ---------- Image preview helpers ----------

    def set_preview_text(self, text: str):
        self.preview_label.configure(text=text, image="")
        self._current_preview_photo = None

    def fetch_thumbnail(self, url: str, max_size=(420, 420)):
        if url in self._preview_cache:
            return self._preview_cache[url]

        req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req, timeout=10) as resp:
            data = resp.read()

        img = Image.open(BytesIO(data))
        img.thumbnail(max_size)
        photo = ImageTk.PhotoImage(img)
        self._preview_cache[url] = photo
        return photo

    def preview_url(self, url: str):
        url = (url or "").strip()
        if not url:
            self.set_preview_text("No link selected.")
            return

        if not looks_like_image_link(url):
            self.set_preview_text("No image preview (not an image URL).")
            return

        try:
            photo = self.fetch_thumbnail(url)
            self.preview_label.configure(text="", image=photo)
            self._current_preview_photo = photo  # keep reference
        except Exception as ex:
            self.set_preview_text(f"Preview failed:\n{ex}")

    def preview_from_current_line(self, _evt=None):
        # get current line where cursor is
        index = self.links_text.index("insert")
        line_no = int(index.split(".")[0])
        line = self.links_text.get(f"{line_no}.0", f"{line_no}.end").strip()
        self.preview_url(line)

    def preview_from_image_list(self, _evt=None):
        sel = self.image_list.curselection()
        if not sel:
            return
        url = self.image_list.get(sel[0])
        self.preview_url(url)

    def preview_from_project_list(self, _evt=None):
        sel = self.project_list.curselection()
        if not sel:
            return
        row = self.project_list.get(sel[0])
        # row ends with the link, split by " | "
        parts = row.split(" | ")
        url = parts[-1].strip() if parts else ""
        self.preview_url(url)

    # ---------- Add all ----------

    def add_all(self):
        links = self.get_links_from_textbox()
        if not links:
            messagebox.showwarning("No links", "Paste links (one per line).")
            return

        allow_dupes = self.allow_duplicates.get()
        mode = self.mode.get()

        if mode == "featured":
            path = self.image_links_path.get().strip()
            if not os.path.exists(path):
                messagebox.showerror("File not found", f"imageLinks.js not found:\n{path}")
                return
            ok, msg = add_many_image_links_file(path, links, allow_dupes)
            if ok:
                messagebox.showinfo("Done", msg)
                self.refresh_previews()
                # Auto-commit if enabled
                if self.auto_commit_var.get():
                    self.git_push()
            else:
                messagebox.showwarning("Not added", msg)

        else:
            path = self.project_js_path.get().strip()
            if not os.path.exists(path):
                messagebox.showerror("File not found", f"project.js not found:\n{path}")
                return

            typ = self.type_var.get().strip()
            media_type = self.media_type_var.get().strip()

            if not typ:
                messagebox.showwarning("Missing type", "Enter type (e.g. 1, 2, 3).")
                return
            if media_type not in ("image", "video", "youtube", "short"):
                messagebox.showwarning("Invalid mediaType", "mediaType must be: image, video, youtube, short.")
                return

            ok, msg = add_many_project_media_file(path, links, typ, media_type, allow_dupes)
            if ok:
                messagebox.showinfo("Done", msg)
                self.refresh_previews()
                # Auto-commit if enabled
                if self.auto_commit_var.get():
                    self.git_push()
            else:
                messagebox.showwarning("Not added", msg)


if __name__ == "__main__":
    LinkManagerApp().mainloop()