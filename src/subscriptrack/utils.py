import calendar
from datetime import date, timedelta


USD_TO_VND_RATE = 25000


# Map subscription names to Simple Icons identifiers for logo display
SERVICE_ICON_MAP = {
    'netflix': ('netflix', '#E50914'),
    'spotify': ('spotify', '#1DB954'),
    'youtube': ('youtube', '#FF0000'),
    'youtube premium': ('youtube', '#FF0000'),
    'youtube music': ('youtube', '#FF0000'),
    'apple music': ('applemusic', '#FA2430'),
    'apple tv': ('appletv', '#000000'),
    'apple fitness': ('applefitness', '#FF2D55'),
    'apple one': ('apple', '#555555'),
    'disney': ('disneyplus', '#113CCF'),
    'disney+': ('disneyplus', '#113CCF'),
    'hbo': ('hbo', '#5822B4'),
    'hbo go': ('hbo', '#5822B4'),
    'prime video': ('amazonprime', '#FF9900'),
    'amazon prime': ('amazonprime', '#FF9900'),
    'twitch': ('twitch', '#9146FF'),
    'steam': ('steam', '#000000'),
    'chatgpt': ('openai', '#10A37F'),
    'openai': ('openai', '#10A37F'),
    'github': ('github', '#181717'),
    'github copilot': ('github', '#181717'),
    'cursor': ('cursor', '#6C47FF'),
    'google one': ('google', '#4285F4'),
    'google drive': ('google', '#4285F4'),
    'google workspace': ('google', '#4285F4'),
    'youtube premium': ('youtube', '#FF0000'),
    'icloud': ('icloud', '#3690F3'),
    'dropbox': ('dropbox', '#0061FF'),
    'onedrive': ('onedrive', '#0078D4'),
    'mega': ('mega', '#D9272E'),
    'microsoft 365': ('microsoftoffice', '#D83B01'),
    'office 365': ('microsoftoffice', '#D83B01'),
    'adobe': ('adobe', '#FF0000'),
    'photoshop': ('adobephotoshop', '#31A8FF'),
    'illustrator': ('adobeillustrator', '#FF9A00'),
    'figma': ('figma', '#F24E1E'),
    'canva': ('canva', '#00C4CC'),
    'notion': ('notion', '#000000'),
    'linear': ('linear', '#5E6AD2'),
    'vercel': ('vercel', '#000000'),
    'netlify': ('netlify', '#00C7B7'),
    'jetbrains': ('jetbrains', '#000000'),
    '1password': ('1password', '#0094F5'),
    'lastpass': ('lastpass', '#D32D27'),
    'bitwarden': ('bitwarden', '#175DDC'),
    'linkedin': ('linkedin', '#0A66C2'),
    'linkedin premium': ('linkedin', '#0A66C2'),
    'x premium': ('x', '#000000'),
    'twitter': ('x', '#000000'),
    'headspace': ('headspace', '#F47D31'),
    'calm': ('calm', '#2B6CB0'),
    'strava': ('strava', '#FC4C02'),
    'duolingo': ('duolingo', '#58CC02'),
    'udemy': ('udemy', '#A435F0'),
    'skillshare': ('skillshare', '#00FF84'),
    'coursera': ('coursera', '#0056D2'),
    'zoom': ('zoom', '#2D8CFF'),
    'slack': ('slack', '#4A154B'),
    'trello': ('trello', '#0052CC'),
    'jira': ('jira', '#0052CC'),
    'asana': ('asana', '#F06A6A'),
    'midjourney': ('midjourney', '#000000'),
    'patreon': ('patreon', '#FF424D'),
    'onlyfans': ('onlyfans', '#00AFF0'),
    'fpt play': ('fptplay', '#E60000'),
    'vieon': ('vieon', '#FF5A00'),
    'zing mp3': ('zingmp3', '#0066FF'),
    'chatgpt plus': ('openai', '#10A37F'),
    'chatgpt pro': ('openai', '#10A37F'),
    'github copilot': ('github', '#181717'),
    'microsoft 365 personal': ('microsoftoffice', '#D83B01'),
    'microsoft 365 family': ('microsoftoffice', '#D83B01'),
    'notion ai': ('notion', '#000000'),
    'notion plus': ('notion', '#000000'),
    'canva pro': ('canva', '#00C4CC'),
    'figma professional': ('figma', '#F24E1E'),
    'cursor pro': ('cursor', '#6C47FF'),
    'vercel pro': ('vercel', '#000000'),
    'github copilot pro': ('github', '#181717'),
    'jetbrains all products': ('jetbrains', '#000000'),
    'apple fitness+': ('applefitness', '#FF2D55'),
    'strava premium': ('strava', '#FC4C02'),
    'duolingo super': ('duolingo', '#58CC02'),
    'udemy personal plan': ('udemy', '#A435F0'),
    'linkedin premium': ('linkedin', '#0A66C2'),
    'x premium': ('x', '#000000'),
    'mega': ('mega', '#D9272E'),
}


def get_service_icon(name):
    """Return (icon_id, color) tuple for a subscription name, or None."""
    name_lower = name.lower().strip()
    # Try exact match first
    if name_lower in SERVICE_ICON_MAP:
        return SERVICE_ICON_MAP[name_lower]
    # Try partial match (longest keyword first)
    matches = []
    for keyword, (icon_id, color) in SERVICE_ICON_MAP.items():
        if keyword in name_lower:
            matches.append((len(keyword), icon_id, color))
    if matches:
        matches.sort(key=lambda x: -x[0])
        return (matches[0][1], matches[0][2])
    return None


# Category keyword mapping for auto-categorization
CATEGORY_KEYWORDS = {
    'Giải trí': [
        'netflix', 'spotify', 'youtube', 'apple music', 'disney', 'hbo', 'hbo go',
        'hulu', 'prime video', 'amazon prime', 'twitch', 'crunchyroll', 'funimation',
        'viki', 'iflix', 'viu', 'zee5', 'hotstar', 'mubi', 'tidal', 'deezer',
        'soundcloud', 'pandora', 'app store', 'google play', 'steam', 'epic games',
        'xbox', 'playstation', 'nintendo', 'game pass', 'ps plus', 'apple tv',
        'tv plus', 'vieon', 'fpt play', 'clip', 'galaxy play', 'poff',
    ],
    'Lưu trữ & Cloud': [
        'google drive', 'google one', 'icloud', 'dropbox', 'onedrive', 'mega',
        'box', 'backblaze', 'carbonite', 'sync', 'pcloud', 'nextcloud', 'aws',
        'cloud storage', 'drive',
    ],
    'Công cụ & Phần mềm': [
        'github', 'gitlab', 'jetbrains', 'figma', 'adobe', 'photoshop',
        'illustrator', 'after effect', 'premiere', 'notion', 'evernote',
        'todoist', 'asana', 'jira', 'trello', 'slack', 'microsoft 365',
        'office 365', 'google workspace', 'zoom', 'microsoft teams',
        'visual studio', 'cursor', 'vscode', 'copilot', 'chatgpt', 'gpt',
        'claude', 'midjourney', 'canva', 'linear', 'datadog', 'mongodb',
        'digitalocean', 'linode', 'vultr', 'namecheap', 'godaddy', 'cloudflare',
        'vercel', 'netlify', 'heroku', 'render', 'firebase', 'supabase',
        'tailwind', 'postman', 'datagrip', 'webstorm', 'pycharm', 'intellij',
        'antivirus', 'norton', 'kaspersky', 'bitdefender', 'malwarebytes',
        '1password', 'lastpass', 'bitwarden', 'dashlane', 'nordpass',
        'grammarly', 'prowritingaid', 'abstract', 'zeplin', 'sketch',
        'invision', 'framer', 'webflow', 'wix', 'squarespace', 'wordpress',
        'shopify', 'sendgrid', 'mailchimp', 'aws', 'azure', 'google cloud',
    ],
    'Truyền thông & Tin tức': [
        'medium', 'substack', 'news', 'nyt', 'new york times', 'washington post',
        'the guardian', 'bloomberg', 'wall street journal', 'economist',
        'vnexpress', 'vietnamnet', 'tuoi tre', 'thanh nien', 'vietnam+',
        'bbc', 'cnn', 'axios', 'politico', 'the verge', 'wired',
        'patreon', 'ko-fi', 'buymeacoffee',
    ],
    'Sức khỏe': [
        'gym', 'fitness', 'peloton', 'strava', 'headspace', 'calm',
        'myfitnesspal', 'fitbit', 'apple fitness', 'health', 'yoga',
        'meditation', 'weight loss', 'hello fresh', 'blue apron',
        'daily harvest', 'factor', 'thera', 'betterhelp', 'talkspace',
        '7m', 'medi', 'thuoc', 'kham', 'bac si', 'fit',
    ],
    'Giáo dục': [
        'udemy', 'coursera', 'edx', 'udacity', 'skillshare', 'linkedin learning',
        'pluralsight', 'codecademy', 'datacamp', 'masterclass', 'brilliant',
        'khan academy', 'duolingo', 'babbel', 'rosetta stone', 'memrise',
        'treehouse', 'teamtreehouse', 'frontend masters', 'egghead',
        'educative', 'leetcode', 'hackerrank', 'codewars', 'exercism',
        'tieng anh', 'tiếng anh', 'hoctienganh', 'ielts', 'toeic', 'toefl',
    ],
    'Mạng xã hội': [
        'onlyfans', 'patreon', 'substack', 'twitter', 'x premium',
        'linkedin premium', 'linkedin', 'tinder', 'bumble', 'hinge',
        'facebook', 'instagram', 'snapchat', 'telegram',
    ],
}


def auto_categorize(name):
    """Auto-detect subscription category from its name."""
    name_lower = name.lower().strip()
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in name_lower:
                return category
    return 'Khác'


def add_months(sourcedate, months):
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def get_next_billing_date(start_date, cycle):
    today = date.today()
    if start_date > today:
        return start_date

    if cycle == 'weekly':
        days_diff = (today - start_date).days
        weeks_diff = days_diff // 7
        next_date = add_days(start_date, weeks_diff * 7)
        if next_date < today:
            next_date = add_days(start_date, (weeks_diff + 1) * 7)
        return next_date
    elif cycle == 'monthly':
        months_diff = (today.year - start_date.year) * 12 + today.month - start_date.month
        next_date = add_months(start_date, months_diff)
        if next_date < today:
            next_date = add_months(start_date, months_diff + 1)
        return next_date
    elif cycle == 'yearly':
        years_diff = today.year - start_date.year
        try:
            next_date = start_date.replace(year=start_date.year + years_diff)
        except ValueError:
            next_date = start_date.replace(year=start_date.year + years_diff, month=2, day=28)

        if next_date < today:
            try:
                next_date = start_date.replace(year=start_date.year + years_diff + 1)
            except ValueError:
                next_date = start_date.replace(year=start_date.year + years_diff + 1, month=2, day=28)
        return next_date


def add_days(sourcedate, days):
    from datetime import timedelta
    return sourcedate + timedelta(days=days)


def get_monthly_cost(amount, cycle, currency):
    """Convert subscription cost to monthly VND."""
    vnd_amount = amount * USD_TO_VND_RATE if currency == 'USD' else amount
    if cycle == 'monthly':
        return vnd_amount
    elif cycle == 'weekly':
        return vnd_amount * 52 / 12
    elif cycle == 'yearly':
        return vnd_amount / 12
    return vnd_amount


def get_yearly_cost(amount, cycle, currency):
    """Convert subscription cost to yearly VND."""
    vnd_amount = amount * USD_TO_VND_RATE if currency == 'USD' else amount
    if cycle == 'yearly':
        return vnd_amount
    elif cycle == 'monthly':
        return vnd_amount * 12
    elif cycle == 'weekly':
        return vnd_amount * 52
    return vnd_amount
