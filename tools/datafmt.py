"""Andmefailide ühtne vorming: objektid taandega, lihtväärtuste massiivid ühel real.
Nii on git-i erinevused loetavad: muutunud aasta väärtus näitab ühte muutunud rida."""
import json

def fmt(x, ind=0):
    p = ' ' * ind
    if isinstance(x, dict):
        if not x:
            return '{}'
        return '{\n' + ',\n'.join(p + ' ' + json.dumps(k, ensure_ascii=False) + ': ' + fmt(v, ind + 1) for k, v in x.items()) + '\n' + p + '}'
    if isinstance(x, list):
        if all(not isinstance(v, (dict, list)) for v in x):
            return json.dumps(x, ensure_ascii=False)
        return '[\n' + ',\n'.join(p + ' ' + fmt(v, ind + 1) for v in x) + '\n' + p + ']'
    return json.dumps(x, ensure_ascii=False)

def write(path, obj, compact=False):
    t = json.dumps(obj, ensure_ascii=False, separators=(',', ':')) if compact else fmt(obj)
    assert json.loads(t) == obj
    with open(path, 'w', encoding='utf-8') as f:
        f.write(t + '\n')
