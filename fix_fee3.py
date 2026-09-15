import os

pages = [
    'app/education/page.tsx',
    'app/legal/page.tsx',
    'app/media/page.tsx',
]

fee_code = """
      // Calculate $0.20 platform fee
      let nativePrice = 300;
      try {
        const priceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
        if (priceRes.ok) {
          const pd = await priceRes.json();
          nativePrice = parseFloat(pd.price) || 300;
        }
      } catch {}
      const feeWei = '0x' + BigInt(Math.floor(0.20 / nativePrice * 1e18)).toString(16);

"""

target = "      const txHash = await window.ethereum.request({"

for path in pages:
    if not os.path.exists(path):
        print(f'SKIP: {path}')
        continue

    content = open(path, 'r', encoding='utf-8').read()

    if 'const feeWei' in content:
        print(f'SKIP already has feeWei: {path}')
        continue

    if target in content:
        content = content.replace(target, fee_code + target)
        open(path, 'w', encoding='utf-8').write(content)
        print(f'FIXED: {path}')
    else:
        print(f'TARGET NOT FOUND: {path}')

print('Done!')