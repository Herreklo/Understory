#!/usr/bin/env python3
"""The project's hooks (.claude/settings.json). One mode per hook; the tool call or stop arrives as JSON on stdin.
Exit 2 refuses it, and what is printed to stderr tells Claude why.

  guard.py battery   PreToolUse: while a battery runs (.claude/battery.lock, written by .claude/hooks/battery.sh), no edit
                     to src/ or scale/ and no git command that changes the tree. A lock whose process is gone is removed.
  guard.py key       PreToolUse: no reading key.json with Read, Grep or Glob, so a blind reader cannot open a key.
                     Scripts read keys through Bash.
  guard.py stop      Stop: no ending a turn while commits this session made (their subject is in one of its commit
                     commands) are on no remote branch. Sessions can share a checkout, and one is not held to another's
                     work. Lets go the second time, so Claude can say why it cannot push.
"""
import json, os, re, subprocess, sys

ROOT = os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()
LOCK = os.path.join(ROOT, '.claude', 'battery.lock')
ENGINE = re.compile(r'(^|[\s\'"=/.])(src|scale)/')
WRITES = re.compile(r'\b(sed|perl)\s+-i|\b(mv|rm|cp|tee|touch|truncate|patch)\b|\bgit\s+(checkout|restore|apply)\b')
REDIRECT = re.compile(r'>\s*[\'"]?(\S*/)?(src|scale)/')
TREE = re.compile(r'\bgit\s+(switch|checkout|pull|merge|rebase|reset|stash|cherry-pick|am)\b')


def refuse(msg):
    print(msg, file=sys.stderr)
    sys.exit(2)


def battery(call):
    if not os.path.exists(LOCK):
        return
    try:
        pid, _, what = open(LOCK).read().strip().partition(' ')
        os.kill(int(pid), 0)
    except (ValueError, ProcessLookupError, OSError):
        os.remove(LOCK)
        return
    tool, inp = call.get('tool_name', ''), call.get('tool_input', {})
    why = f'A battery is running ({what}), and it reads the engine from this checkout. '
    why += 'Wait for it, or work in a worktree (git worktree add ../lab-edit -b <branch>).'
    if tool == 'Bash':
        cmd = inp.get('command', '')
        if TREE.search(cmd) or REDIRECT.search(cmd) or (ENGINE.search(cmd) and WRITES.search(cmd)):
            refuse(why)
    else:
        path = os.path.relpath(os.path.abspath(inp.get('file_path') or inp.get('notebook_path') or ''), ROOT)
        if re.match(r'(src|scale)/', path):
            refuse(why)


def key(call):
    inp = call.get('tool_input', {})
    if any('key.json' in str(inp.get(k, '')) for k in ('file_path', 'path', 'pattern', 'glob')):
        refuse('key.json is closed to Read, Grep and Glob, so that no blind reader can open a key. '
               'Scripts read keys (python3, jq, scripts/pairscore.py).')


COMMITS = re.compile(r'\bgit\s+(commit|cherry-pick|revert|am)\b')


def own_commands(transcript):
    """This session's shell commands that make commits, or None when its transcript cannot be read."""
    try:
        cmds = []
        with open(transcript) as f:
            for line in f:
                if '"tool_use"' not in line or 'git' not in line:
                    continue
                for part in json.loads(line).get('message', {}).get('content', []):
                    if isinstance(part, dict) and part.get('type') == 'tool_use' and part.get('name') == 'Bash':
                        cmd = part.get('input', {}).get('command', '')
                        if COMMITS.search(cmd):
                            cmds.append(cmd)
        return cmds
    except (OSError, ValueError, AttributeError, TypeError):
        return None


def stop(call):
    if call.get('stop_hook_active'):
        return
    git = lambda *a: subprocess.run(['git', '-C', ROOT, *a], capture_output=True, text=True)
    branch = git('symbolic-ref', '--short', '-q', 'HEAD').stdout.strip()
    if not branch:
        return
    # Commits on no remote branch at all, so work already on main or pushed elsewhere is not counted.
    subjects = git('log', '--format=%s', '-n', '50', 'HEAD', '--not', '--remotes').stdout.splitlines()
    cmds = own_commands(call.get('transcript_path', ''))
    if cmds is not None:
        subjects = [s for s in subjects if any(s in c for c in cmds)]
    if subjects:
        refuse(f'{len(subjects)} commit(s) this session made on {branch} are not on GitHub. Push them '
               f'(git push -u origin {branch}) before the turn ends, or say why they must wait.')


if __name__ == '__main__':
    try:
        call = json.load(sys.stdin)
    except ValueError:
        call = {}
    {'battery': battery, 'key': key, 'stop': stop}[sys.argv[1]](call)
