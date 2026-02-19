/**
 * LogoMark — VYN brand logo rendered in exact Tailwind blue-600 color.
 * Uses CSS mask-image technique: logo.png acts as a mask,
 * the div background shows through — guaranteeing pixel-perfect color match.
 */
export function LogoMark({ size = 44, className = '' }: { size?: number; className?: string }) {
    return (
        <div
            className={`flex-shrink-0 ${className}`}
            style={{
                width: size,
                height: size,
                backgroundColor: 'oklch(54.6% 0.245 262.881)', // Tailwind v4 blue-600 exact
                WebkitMaskImage: 'url(/logo.png)',
                maskImage: 'url(/logo.png)',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
            }}
        />
    );
}
