"""Rebuild the local Noto Sans SC subset after editing Chinese content.

Usage: python scripts/subset-font.py /path/to/NotoSansSC.ttf
Download the upstream OFL font from google/fonts, ofl/notosanssc.
"""
from pathlib import Path
import sys
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
text = ''.join(p.read_text(encoding='utf-8') for p in (root / 'src').rglob('*')
               if p.suffix in {'.astro', '.ts', '.json'})
text += '中文字体已复制请手动复制深浅色模式切换到邮箱地址'
font = TTFont(source)
options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['*']
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
font.flavor = 'woff2'
target = root / 'public/fonts/noto-sans-sc-site.woff2'
font.save(target)
used = {ord(c) for c in text if 0x3000 <= ord(c) <= 0x9fff}
missing = used - font.getBestCmap().keys()
if missing:
    raise RuntimeError(f'Missing Chinese glyphs: {missing}')
print(f'Font subset: {target.stat().st_size:,} bytes; {len(used)} CJK glyphs; all covered.')
