import os
import re

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

for path in pages:
    if not os.path.exists(path):
        print(f'SKIP: {path}')
        continue
    
    content = open(path, 'r', encoding='utf-8').read()
    
    # Remove any previously inserted fee code that may be misplaced
    content = re.sub(
        r'\n\s*// Calculate \$0\.20 platform fee[\s\S]*?const feeWei[^\n]*\n',
        '\n',
        content
    )

    # Remove sym-based fee code too
    content = re.sub(
        r'\n\s*// Calculate \$0\.20 fee[\s\S]*?const feeWei[^\n]*\n',
        '\n',
        content
    )

    # Insert fee code just before eth_sendTransaction
    content = content.replace(
        "const txHashResult = await window.ethereum.request({\n        method: 'eth_sendTransaction',",
        fee_code + "\n      const txHashResult = await window.ethereum.request({\n        method: 'eth_sendTransaction',"
    )

    open(path, 'w', encoding='utf-8').write(content)
    print(f'FIXED: {path}')

print('Done!')