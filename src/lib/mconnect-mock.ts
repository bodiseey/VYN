export const MOCK_GOV_DATA: any = {
    '1NXBR32E85Z505904': {
        vehicle: {
            IDNV: '1NXBR32E85Z505904',
            Mark: 'TOYOTA',
            Model: 'COROLLA',
            Color: 'ARGINTIU',
            Year: 2005,
            BodyType: 'SEDAN',
            FuelType: 'BENZINĂ',
            Status: 'ÎNREGISTRATĂ',
            RegistrationDate: '2021-05-15',
            LastOperation: 'REÎNMATRICULARE (PROPRIETAR NOU)'
        },
        inspections: [
            { ReportNumber: 'TR-123456', Date: '2023-05-10', ExpiryDate: '2024-05-10', Mileage: 125400, Result: 'PASSED', Station: 'Statia 01-Chisinau' }
        ],
        borderCrossings: [
            { Point: 'LEUȘENI', DateTime: '2023-08-15 10:30', Direction: 'EXIT' },
            { Point: 'LEUȘENI', DateTime: '2023-08-30 18:45', Direction: 'ENTRY' }
        ],
        vignettes: []
    },
    'WBAJV51000L123456': {
        vehicle: {
            IDNV: 'WBAJV51000L123456',
            Mark: 'BMW',
            Model: 'X5',
            Color: 'NEGRU',
            Year: 2020,
            BodyType: 'SUV',
            FuelType: 'MOTORINĂ',
            Status: 'ÎNREGISTRATĂ',
            RegistrationDate: '2023-11-20',
            LastOperation: 'IMPORT (PRIMA ÎNMATRICULARE)'
        },
        inspections: [
            { ReportNumber: 'TR-777888', Date: '2023-11-25', ExpiryDate: '2024-11-25', Mileage: 45200, Result: 'PASSED', Station: 'Statia 02-Chisinau' }
        ],
        borderCrossings: [
            { Point: 'LEUȘENI', DateTime: '2023-11-15 14:20', Direction: 'ENTRY' }
        ],
        vignettes: []
    }
};
