import os

pages = [
    'app/education/page.tsx',
    'app/legal/page.tsx',
    'app/media/page.tsx',
    'app/registry/page.tsx',
]

old = """to: '0x000000000000000000000000000000000000dEaD',
          value: '0x0',
          data: dataHex,
          gas: '0x186A0',"""

new = """to: '0x2b2df01fcd78986c1ebdedfdbdaa909f0663ac6a',
          value: feeWei,
          data: dataHex,
          gas: '0x30D40',"""

fee_code = """
      // Calculate $0.20 platform fee in native token
      let nativePrice = 300;
      try {
        const sym = chain?.symbol === 'ETH' ? 'ETH' : chain?.symbol === 'MATIC' ? 'MATIC' : 'BNB';
        const priceRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}USDT`);
        if (priceRes.ok) {
          const priceData = await priceRes.json();
          nativePrice = parseFloat(priceData.price) || 300;
        }
      } catch {}
      const feeInNative = 0.20 / nativePrice;
      const feeWei = '0x' + BigInt(Math.floor(feeInNative * 1e18)).toString(16);
"""

for path in pages:
    if not os.path.exists(path):
        print(f'SKIP: {path}')
        continue
    
    content = open(path, 'r', encoding='utf-8').read()
    
    if '0x000000000000000000000000000000000000dEaD' not in content:
        print(f'SKIP (already fixed): {path}')
        continue
    
    # Add fee calculation before the transaction
    content = content.replace(
        "      setStep('sign');",
        "      setStep('sign');\n" + fee_code
    )
    
    # Replace the dead address with payment wallet
    content = content.replace(old, new)
    
    open(path, 'w', encoding='utf-8').write(content)
    print(f'FIXED: {path}')

print('Done!')