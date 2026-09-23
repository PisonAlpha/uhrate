import os
import glob

files = glob.glob('app/**/*.tsx', recursive=True)

old = """    if (!window.ethereum) {
      setError('MetaMask not found. Please install MetaMask.');
      return;
    }"""

new = """    if (!window.ethereum) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const currentUrl = window.location.href;
        window.location.href = `https://metamask.app.link/dapp/${currentUrl.replace('https://', '')}`;
        return;
      }
      setError('MetaMask not found. Please install MetaMask extension on desktop or open this page inside MetaMask browser on mobile.');
      return;
    }"""

# Also fix the presale and registry pages which have different error messages
old2 = """    if (!window.ethereum) {
      setError('MetaMask not found. Please install MetaMask to use wallet login.');
      return;
    }"""

old3 = """    if (!window.ethereum) {
      setError('Please install MetaMask to seal files on the blockchain.');
      return;
    }"""

old4 = """    if (!window.ethereum) {
      setError('Please install MetaMask to deploy to blockchain.');
      return;
    }"""

old5 = """    if (!window.ethereum) {
      alert('Please install MetaMask to mint NFTs');
      return;
    }"""

mobile_redirect = """
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const currentUrl = window.location.href;
        window.location.href = `https://metamask.app.link/dapp/${currentUrl.replace('https://', '')}`;
        return;
      }"""

count = 0
for path in files:
    try:
        content = open(path, 'r', encoding='utf-8').read()
        new_content = content

        for old_str in [old, old2, old3, old4, old5]:
            if old_str in new_content:
                # Extract the error message
                lines = old_str.strip().split('\n')
                error_line = [l for l in lines if 'setError' in l or 'alert' in l]
                error_msg = error_line[0].strip() if error_line else "setError('Please install MetaMask on desktop or open inside MetaMask browser on mobile.');"
                
                replacement = f"""    if (!window.ethereum) {{{mobile_redirect}
      {error_msg}
      return;
    }}"""
                new_content = new_content.replace(old_str, replacement)

        if new_content != content:
            open(path, 'w', encoding='utf-8').write(new_content)
            print(f'FIXED: {path}')
            count += 1
    except Exception as e:
        print(f'ERROR: {path} — {e}')

print(f'Done! Fixed {count} files.')