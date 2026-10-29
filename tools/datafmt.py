"""Andmefailide ühtne vorming: objektid taandega, lihtväärtuste massiivid ühel real.
Nii on git-i erinevused loetavad: muutunud aasta väärtus näitab ühte muutunud rida."""
import json

def _num(x):
    # täisarvuline murdarv (6159.0) kirjutatakse täisarvuna: JavaScriptis sama number, git-is stabiilne vorming
    if isinstance(x, float) and x.is_integer() and abs(x) < 2**53:
        return int(x)
    if isinstance(x, (list, tuple)):
        return [_num(v) for v in x]
    if isinstance(x, dict):
        return {k: _num(v) for k, v in x.items()}
    return x

def fmt(x, ind=0):
    p = ' ' * ind
    if isinstance(x, dict):
        if not x:
            return '{}'
        return '{\n' + ',\n'.join(p + ' ' + json.dumps(str(k), ensure_ascii=False) + ': ' + fmt(v, ind + 1) for k, v in x.items()) + '\n' + p + '}'
    if isinstance(x, (list, tuple)):
        if all(not isinstance(v, (dict, list, tuple)) for v in x):
            return json.dumps(x, ensure_ascii=False)
        return '[\n' + ',\n'.join(p + ' ' + fmt(v, ind + 1) for v in x) + '\n' + p + ']'
    return json.dumps(x, ensure_ascii=False)

def write(path, obj, compact=False):
    obj = _num(obj)
    t = json.dumps(obj, ensure_ascii=False, separators=(',', ':')) if compact else fmt(obj)
    assert json.loads(t) == json.loads(json.dumps(obj))  # JSON-is on võtmed alati tekst
    with open(path, 'w', encoding='utf-8') as f:
        f.write(t + '\n')
