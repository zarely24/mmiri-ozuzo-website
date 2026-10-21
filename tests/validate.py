#!/usr/bin/env python3
"""Structural HTML validation for dist/ using only the standard library.
Checks: balanced tags, duplicate ids, img alt, a[target=_blank] rel, buttons with names,
lang attribute, exactly one <main>, landmarks, form-free, no inline style/event attributes.
Exit 1 on failures."""
import sys, re
from pathlib import Path
from html.parser import HTMLParser

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr','path','circle','rect','use','polyline','polygon','line'}
DIST = Path(__file__).resolve().parent.parent / 'dist'

class V(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack=[]; self.errors=[]; self.ids={}; self.mains=0; self.lang=None
        self.btn_depth=None; self.btn_text=''; self.btn_has_label=False
        self.a_depth=None; self.a_text=''; self.a_has_label=False; self.svg=0
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='svg': self.svg+=1
        if tag=='html': self.lang=a.get('lang')
        if tag=='main': self.mains+=1
        if 'style' in a: self.errors.append(f'inline style on <{tag}>')
        for k in a:
            if k.startswith('on'): self.errors.append(f'inline handler {k} on <{tag}>')
        if 'id' in a:
            self.ids[a['id']]=self.ids.get(a['id'],0)+1
        if tag=='img' and 'alt' not in a: self.errors.append('img without alt')
        if tag=='a' and a.get('target')=='_blank' and ('noopener' not in (a.get('rel') or '')): self.errors.append(f'a[target=_blank] without noopener: {a.get("href")}')
        if tag=='a' and self.a_depth is None:
            self.a_depth=len(self.stack); self.a_text=''; self.a_has_label=bool(a.get('aria-label'))
        if tag=='button':
            self.btn_depth=len(self.stack); self.btn_text=''; self.btn_has_label=bool(a.get('aria-label'))
        if tag=='iframe': self.errors.append('iframe present at load')
        if tag in ('form','input','textarea','select') : self.errors.append(f'<{tag}> present (site should have no forms)')
        if tag not in VOID: self.stack.append(tag)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack and self.stack[-1]==tag: self.stack.pop()
    def handle_endtag(self, tag):
        if tag=='svg': self.svg-=1
        if tag in VOID: return
        if not self.stack: self.errors.append(f'stray </{tag}>'); return
        if self.stack[-1]==tag:
            self.stack.pop()
        else:
            if tag in self.stack:
                self.errors.append(f'misnested </{tag}> (open: {self.stack[-3:]})')
                while self.stack and self.stack[-1]!=tag: self.stack.pop()
                self.stack.pop()
            else:
                self.errors.append(f'unexpected </{tag}>')
        if tag=='button' and self.btn_depth is not None and len(self.stack)==self.btn_depth:
            if not self.btn_text.strip() and not self.btn_has_label: self.errors.append('button without accessible name')
            self.btn_depth=None
        if tag=='a' and self.a_depth is not None and len(self.stack)==self.a_depth:
            if not self.a_text.strip() and not self.a_has_label: self.errors.append('link without accessible name')
            self.a_depth=None
    def handle_data(self, data):
        if self.btn_depth is not None: self.btn_text+=data
        if self.a_depth is not None: self.a_text+=data

def main():
    fails=0
    for f in sorted(DIST.rglob('*.html')):
        v=V(); v.feed(f.read_text(encoding='utf-8')); v.close()
        errs=list(v.errors)
        if v.stack: errs.append(f'unclosed tags at EOF: {v.stack}')
        dup=[k for k,n in v.ids.items() if n>1]
        if dup: errs.append(f'duplicate ids: {dup}')
        if v.mains!=1: errs.append(f'<main> count {v.mains}')
        if v.lang not in ('el','en'): errs.append(f'html lang {v.lang}')
        rel=f.relative_to(DIST).as_posix()
        if errs:
            fails+=1; print(f'FAIL {rel}'); [print('   -',e) for e in errs]
        else:
            print(f'ok   {rel}')
    print(f'\n{fails} file(s) with problems.')
    return 1 if fails else 0

if __name__=='__main__':
    sys.exit(main())
