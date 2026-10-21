#!/usr/bin/env python3
"""The project's hooks (.claude/settings.json). One mode per hook; the tool call or stop arrives as JSON on stdin.
Exit 2 refuses it, and what is printed to stderr tells Claude why.

  guard.py battery   PreToolUse: while a battery runs (.claude/battery.lock, written by .claude/hooks/battery.sh), no edit
                     to src/ or scale/ and no git command that changes the tree. A lock whose process is gone is removed.
  guard.py key       PreToolUse: no reading key.json with Read, Grep or Glob, so a blind reader cannot open a key.
                     Scripts read keys through Bash.
  guard.py stop      Stop: no ending a turn with commits on this branch that are not pushed. Lets go the second time,
                     so Claude can say why it cannot push.
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


def stop(call):
    if call.get('stop_hook_active'):
        return
    git = lambda *a: subprocess.run(['git', '-C', ROOT, *a], capture_output=True, text=True)
    branch = git('symbolic-ref', '--short', '-q', 'HEAD').stdout.strip()
    if not branch:
        return
    up = '@{u}' if git('rev-parse', '-q', '--verify', '@{u}').returncode == 0 else 'origin/main'
    ahead = git('rev-list', '--count', f'{up}..HEAD').stdout.strip()
    if ahead and ahead != '0':
        refuse(f'{ahead} commit(s) on {branch} are not pushed. Push them (git push -u origin {branch}), '
               'so the work is on GitHub before the turn ends, or say why they must wait.')


if __name__ == '__main__':
    try:
        call = json.load(sys.stdin)
    except ValueError:
        call = {}
    {'battery': battery, 'key': key, 'stop': stop}[sys.argv[1]](call)
