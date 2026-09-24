import glob

for f in glob.glob('*.html'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    content = content.replace(
        'class="md:hidden text-2xl text-gray-700 dark:text-gray-300 ml-2" aria-label="Toggle Mobile Menu"', 
        'class="md:hidden text-2xl text-gray-700 dark:text-gray-300" aria-label="Toggle Mobile Menu"'
    )
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
print("Done fixing hamburger margin")
