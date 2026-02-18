/**
 * Utility to get accurate car brand logos based on the brand name returned by NHTSA
 */
export function getBrandLogo(brandName: string): string {
    const brand = brandName.toUpperCase().trim();

    const domainMap: Record<string, string> = {
        'MERCEDES-BENZ': 'mercedes-benz.com',
        'BMW': 'bmw.com',
        'AUDI': 'audi.com',
        'TESLA': 'tesla.com',
        'TOYOTA': 'toyota.com',
        'FORD': 'ford.com',
        'VOLKSWAGEN': 'volkswagen.com',
        'VW': 'volkswagen.com',
        'LAND ROVER': 'landrover.com',
        'PORSCHE': 'porsche.com',
        'HONDA': 'honda.com',
        'HYUNDAI': 'hyundai.com',
        'KIA': 'kia.com',
        'MAZDA': 'mazda.com',
        'NISSAN': 'nissanusa.com',
        'CHEVROLET': 'chevrolet.com',
        'CHRYSLER': 'chrysler.com',
        'DODGE': 'dodge.com',
        'JEEP': 'jeep.com',
        'RAM': 'ramtrucks.com',
        'LEXUS': 'lexus.com',
        'ACURA': 'acura.com',
        'INFINITI': 'infiniti.com',
        'CADILLAC': 'cadillac.com',
        'BUICK': 'buick.com',
        'GMC': 'gmc.com',
        'VOLVO': 'volvocars.com',
        'JAGUAR': 'jaguar.com',
        'SUBARU': 'subaru.com',
        'MITSUBISHI': 'mitsubishicars.com',
        'PEUGEOT': 'peugeot.com',
        'RENAULT': 'renault.com',
        'DACIA': 'dacia.com',
        'FIAT': 'fiat.com',
        'SKODA': 'skoda-auto.com',
        'SEAT': 'seat.com',
        'ALFA ROMEO': 'alfaromeo.com'
    };

    const domain = domainMap[brand] || `${brand.toLowerCase().replace(/\s+/g, '')}.com`;

    // Using Google's official favicon service for consistent, authentic logos
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}
