content = open('app/components/Nav.tsx', 'r', encoding='utf-8').read()

# Find the correct ending and cut everything after the closing mobile menu div
correct_end = """        </div>
      )}
    </header>
  );
}"""

# Find where the broken code starts
broken_start = content.find("\n            <p className=\"text-xs font-bold text-gray-900\">{partner.name}</p>\n          </a>\n        ))}\n      </div>")

if broken_start != -1:
    content = content[:broken_start] + "\n    </header>\n  );\n}\n"
    open('app/components/Nav.tsx', 'w', encoding='utf-8').write(content)
    print('FIXED Nav.tsx')
else:
    print('Pattern not found - checking...')
    # Find the last occurrence of the closing mobile menu
    idx = content.rfind("        </div>\n      )}\n")
    if idx != -1:
        content = content[:idx + len("        </div>\n      )}\n")] + "    </header>\n  );\n}\n"
        open('app/components/Nav.tsx', 'w', encoding='utf-8').write(content)
        print('FIXED Nav.tsx (fallback)')