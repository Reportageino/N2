"""Downloads the game fonts from Google Fonts so the APK works offline."""
import os, re, sys, urllib.request
out = sys.argv[1] if len(sys.argv) > 1 else 'android/app/src/main/assets/fonts'
os.makedirs(out, exist_ok=True)
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
url = 'https://fonts.googleapis.com/css2?family=Bungee&family=Lalezar&family=Vazirmatn:wght@400;700;900&display=swap'
css = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA})).read().decode()
n = 0
def grab(m):
    global n
    src = m.group(1); n += 1
    name = f'f{n}.woff2'
    data = urllib.request.urlopen(urllib.request.Request(src, headers={'User-Agent': UA})).read()
    open(os.path.join(out, name), 'wb').write(data)
    return f'url({name})'
css = re.sub(r'url\((https://[^)]+)\)', grab, css)
open(os.path.join(out, 'fonts.css'), 'w').write(css)
print('fonts saved:', n)
