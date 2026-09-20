content = open('app/page.tsx', 'r', encoding='utf-8').read()

# Find where broken code starts after footer
broken_start = content.find("\n            <p className=\"text-xs font-bold text-gray-900\">{partner.name}</p>\n          </a>\n        ))}\n      </div>")

if broken_start != -1:
    content = content[:broken_start] + "\n    </main>\n  );\n}\n"
    open('app/page.tsx', 'w', encoding='utf-8').write(content)
    print('FIXED page.tsx')
else:
    # Find last </footer> and close properly
    idx = content.rfind("      </footer>\n")
    if idx != -1:
        content = content[:idx + len("      </footer>\n")] + "    </main>\n  );\n}\n"
        open('app/page.tsx', 'w', encoding='utf-8').write(content)
        print('FIXED page.tsx (fallback)')
    else:
        print('Could not fix automatically')