content = open('app/tokenomics/page.tsx', 'r', encoding='utf-8').read()

old = """  const allocation = [
    { category: 'Community & Ecosystem', percent: 30, tokens: '300,000,000', vesting: 'Released over 4 years', color: 'bg-blue-500' },
    { category: 'Platform Rewards & Staking', percent: 20, tokens: '200,000,000', vesting: 'Monthly unlock over 3 years', color: 'bg-purple-500' },
    { category: 'Team & Founders', percent: 15, tokens: '150,000,000', vesting: '12-month cliff, 3-year vest', color: 'bg-gray-700' },
    { category: 'Public Sale', percent: 12, tokens: '120,000,000', vesting: '20% TGE, 80% over 12 months', color: 'bg-green-500' },
    { category: 'Treasury & Reserve', percent: 10, tokens: '100,000,000', vesting: 'Locked 2 years, DAO controlled', color: 'bg-amber-500' },
    { category: 'Presale', percent: 8, tokens: '80,000,000', vesting: '6-month cliff, 18-month vest', color: 'bg-red-500' },
    { category: 'Advisors & Partners', percent: 5, tokens: '50,000,000', vesting: '6-month cliff, 2-year vest', color: 'bg-pink-500' },
  ];"""

new = """  const allocation = [
    { category: 'Community & Ecosystem', percent: 23.92, tokens: '239,191,919', vesting: 'Linear over 48 months from TGE', color: 'bg-blue-500' },
    { category: 'Platform Rewards & Staking', percent: 20, tokens: '200,000,000', vesting: 'Starts post-TGE, monthly unlock over 36 months', color: 'bg-purple-500' },
    { category: 'Angel Round', percent: 8.08, tokens: '80,808,081', vesting: '6-month cliff, linear over 18 months', color: 'bg-orange-500' },
    { category: 'Treasury & Reserve', percent: 10, tokens: '100,000,000', vesting: '24-month lock, DAO controlled release', color: 'bg-amber-500' },
    { category: 'Presale', percent: 8, tokens: '80,000,000', vesting: '6-month cliff, linear over 18 months', color: 'bg-red-500' },
    { category: 'Team & Founders', percent: 12, tokens: '120,000,000', vesting: '12-month cliff, linear over 36 months', color: 'bg-gray-700' },
    { category: 'Public Sale', percent: 7, tokens: '70,000,000', vesting: '20% at TGE, 80% linear over 12 months', color: 'bg-green-500' },
    { category: 'Liquidity', percent: 6, tokens: '60,000,000', vesting: '50% at TGE, 50% over 6 months', color: 'bg-cyan-500' },
    { category: 'Advisors & Partners', percent: 5, tokens: '50,000,000', vesting: '6-month cliff, linear over 24 months', color: 'bg-pink-500' },
  ];"""

if old in content:
    content = content.replace(old, new)
    print('REPLACED: allocation')
else:
    print('NOT FOUND - trying partial match')
    import re
    match = re.search(r'const allocation = \[[\s\S]*?\];', content)
    if match:
        print('Found at:', match.start())
        print(match.group()[:200])

open('app/tokenomics/page.tsx', 'w', encoding='utf-8').write(content)
print('Done!')