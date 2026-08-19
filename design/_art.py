import math

RND = 'fill="none" stroke-linecap="round" stroke-linejoin="round"'

def lens(R=250):
    """Hero orbit lens: soft disc with orbit rings and nodes."""
    p = [f'<defs><radialGradient id="lg" cx="38%" cy="32%" r="78%">'
         f'<stop offset="0%" stop-color="var(--ivory)"/>'
         f'<stop offset="58%" stop-color="var(--sand)"/>'
         f'<stop offset="100%" stop-color="var(--sand2)"/></radialGradient></defs>',
         f'<circle cx="0" cy="0" r="{R}" fill="url(#lg)"/>',
         f'<circle cx="0" cy="0" r="{R-1}" fill="none" stroke="var(--sand2)" stroke-width="1"/>',
         f'<circle cx="0" cy="0" r="{R+26}" fill="none" stroke="var(--sand2)" stroke-width="1" stroke-dasharray="1 9" opacity="0.9"/>']
    for rot in (0, 60, -60):
        p.append(f'<ellipse cx="0" cy="0" rx="176" ry="66" fill="none" stroke="var(--gold)" '
                 f'stroke-width="1.1" opacity="0.55" transform="rotate({rot})"/>')
    for rot in (0, 120, 240):
        a = math.radians(rot)
        x, y = 176 * math.cos(a), 176 * math.sin(a)
        p.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5" fill="var(--gold)"/>')
    p.append('<circle cx="0" cy="0" r="8" fill="var(--gold)"/>')
    return "\n".join(p)

def _med(inner, tint='var(--sand)'):
    return (f'<circle cx="90" cy="90" r="90" fill="{tint}"/>'
            f'<g stroke="var(--ink)" stroke-width="1.5" opacity="0.9" {RND}>{inner}</g>')

def med_window():
    return _med('<rect x="46" y="44" width="88" height="92" rx="12"/>'
                '<path d="M90 44 V136"/>'
                '<path d="M100 58 L118 76" opacity="0.55"/>'
                '<path d="M100 74 L112 86" opacity="0.35"/>')

def med_home():
    return _med('<path d="M44 92 L90 52 L136 92"/>'
                '<path d="M56 88 V128 q0 8 8 8 h52 q8 0 8 -8 V88"/>'
                '<path d="M80 136 v-24 q0 -6 6 -6 h8 q6 0 6 6 v24"/>')

def med_shield():
    return _med('<path d="M90 44 L124 58 v26 q0 30 -34 42 q-34 -12 -34 -42 V58 Z"/>'
                '<path d="M76 90 l10 11 l20 -22"/>')

def med_textile():
    return _med('<path d="M46 122 v-24 q0 -10 10 -10 h68 q10 0 10 10 v24"/>'
                '<path d="M46 122 h88"/>'
                '<path d="M60 88 v-16 q0 -8 8 -8 h44 q8 0 8 8 v16"/>'
                '<path d="M62 122 v10 M118 122 v10"/>')

def arc_track(w=1240):
    """Soft arc with four nodes for the process rail."""
    xs = [w * (i + 0.5) / 4 for i in range(4)]
    def y(x):
        t = x / w
        return 74 - 184 * t + 184 * t * t + 4
    p = [f'<path d="M 0 78 Q {w/2} -12 {w} 78" fill="none" stroke="var(--sand2)" stroke-width="1.4"/>']
    for i, x in enumerate(xs):
        yy = y(x)
        gold = (i == 3)
        col = 'var(--gold)' if gold else 'var(--sand2)'
        p.append(f'<circle cx="{x:.1f}" cy="{yy:.1f}" r="7" fill="var(--ivory)" stroke="{col}" stroke-width="1.6"/>')
        if gold:
            p.append(f'<circle cx="{x:.1f}" cy="{yy:.1f}" r="3" fill="var(--gold)"/>')
    return "\n".join(p)
