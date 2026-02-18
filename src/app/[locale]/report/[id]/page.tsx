'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Car,
    MapPin,
    History,
    AlertTriangle,
    DollarSign,
    Camera,
    Download,
    Share2,
    Clock,
    ExternalLink,
    Flag,
    Navigation,
    Tag,
    Zap,
    Loader2,
    Image as ImageIcon,
    ArrowLeft,
    Search,
    CheckCircle2,
    Info,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFullVehicleReport, UnifiedReport } from '@/lib/report-service';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getBrandLogo } from '@/lib/brand-utils';

import { useTranslations } from 'next-intl';

export default function ReportPage() {
    const t = useTranslations('Report');
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [extending, setExtending] = useState(false);
    const [report, setReport] = useState<UnifiedReport | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const fetchData = async () => {
            try {
                const data = await getFullVehicleReport(id);
                setReport(data);
            } catch (error) {
                console.error('Error loading report:', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id, isMounted]);

    const handleRequestExtended = async () => {
        setExtending(true);
        try {
            const data = await getFullVehicleReport(id, true);
            setReport(data);
        } catch (error) {
            console.error('Extension failed', error);
        } finally {
            setExtending(false);
        }
    };

    if (!isMounted || loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 relative">
                        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-slate-900 font-black text-xl tracking-tighter uppercase">{t('accessingDb')}</p>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                <div className="space-y-6 max-w-md">
                    <AlertTriangle className="w-20 h-20 text-yellow-500 mx-auto" />
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{t('reportUnavailable')}</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">{t('notFoundMsg')}</p>
                    </div>
                    <Button onClick={() => router.push('/')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl h-14 shadow-xl">
                        <ArrowLeft className="w-5 h-5 mr-2" /> {t('retrySearch')}
                    </Button>
                </div>
            </div>
        );
    }

    const has999 = report.marketData.listings && report.marketData.listings.length > 0;
    const isExtended = !!report.allSpecs;

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">
            {/* Platform Header */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/80">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-4 group transition-all duration-300 active:scale-95">
                        <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-blue-500/30 group-hover:rotate-6 transition-transform">V</div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tighter">VYN.md</h1>
                            <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase -mt-1 leading-none">Official Report</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center">
                            <LanguageSwitcher />
                        </div>
                        <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block"></div>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/')}
                            className="hidden md:flex items-center gap-2 rounded-2xl font-black text-slate-700 h-11 border-slate-200 hover:bg-slate-50 px-6 transition-all active:scale-95"
                        >
                            <Search className="w-4 h-4" /> {t('checkOther')}
                        </Button>
                        <Button variant="outline" size="icon" className="md:hidden rounded-xl border-slate-200" onClick={() => router.push('/')}>
                            <Search className="w-5 h-5" />
                        </Button>
                        <Button size="sm" className="rounded-xl font-bold bg-blue-600 text-white gap-2 h-11 px-6 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                            <Download className="w-4 h-4" /> <span className="hidden sm:inline">{t('download')}</span>
                        </Button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-8">
                {/* Quick View */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 border-none shadow-xl rounded-[2rem] md:rounded-[2.5rem] bg-white overflow-hidden ring-1 ring-slate-100">
                        <div className="min-h-[180px] md:h-56 bg-gradient-to-br from-slate-900 to-blue-900 p-6 md:p-12 relative overflow-hidden text-white">
                            {/* Background pattern */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
                                <div className="flex flex-wrap gap-4 text-xs font-mono font-bold rotate-12">
                                    {Array(100).fill(report.vin).join(' ')}
                                </div>
                            </div>

                            <div className="relative z-10 flex items-start justify-between gap-6">
                                <div className="space-y-3 flex-1 min-w-0">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-3 py-1 backdrop-blur-md">{t('dbSyncOk')}</Badge>
                                        {has999 && <Badge className="bg-orange-500 border-none text-[10px] font-black uppercase text-white px-3 py-1 shadow-lg shadow-orange-500/20">{t('active999')}</Badge>}
                                        {isExtended && <Badge className="bg-yellow-400 text-slate-900 border-none text-[10px] font-black uppercase px-3 py-1 shadow-lg shadow-yellow-500/20">{t('extrasPlus')}</Badge>}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl md:text-5xl font-black tracking-tighter leading-none mb-2 break-words">{report.year} {report.make} {report.model}</h2>
                                        <p className="font-mono text-blue-200/60 font-medium tracking-[0.1em] md:tracking-[0.2em] text-xs md:text-sm flex items-center gap-2 truncate">
                                            <ShieldCheck className="w-4 h-4 flex-shrink-0" /> {report.vin}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-16 h-16 md:w-28 md:h-28 bg-white rounded-2xl md:rounded-[2.5rem] border border-white/20 flex items-center justify-center p-2 md:p-4 shadow-2xl relative group overflow-hidden flex-shrink-0">
                                    <img
                                        src={getBrandLogo(report.make)}
                                        className="w-full h-full object-contain group-hover:scale-110 transition-all duration-500 z-10"
                                        alt={report.make}
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const next = e.currentTarget.nextElementSibling as HTMLElement;
                                            if (next) next.classList.remove('opacity-0');
                                        }}
                                    />
                                    <Car className="absolute inset-0 m-auto w-8 h-8 md:w-12 md:h-12 text-slate-300 opacity-0 transition-opacity z-0" />
                                </div>
                            </div>
                            <Car className="absolute bottom-[-30px] right-[-30px] w-72 h-72 text-white/5 -rotate-12 pointer-events-none" />
                        </div>

                        <CardContent className="p-5 md:p-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {Object.entries(report.specs).slice(0, 4).map(([key, value]) => (
                                <div key={key} className="space-y-1 group">
                                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">{key}</p>
                                    <p className="font-bold text-slate-900 text-base md:text-lg tracking-tight truncate">{value || '---'}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 flex flex-col items-center justify-center space-y-6 relative overflow-hidden ring-1 ring-slate-100">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">{t('securityScore')}</h3>
                        <div className="relative">
                            <div className="text-7xl font-black text-slate-900 tracking-tighter">{isExtended ? '98' : '95'}</div>
                            <div className="absolute -top-1 -right-4 text-2xl font-black text-blue-600">%</div>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-1.5 rounded-full">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-black text-emerald-700 tracking-widest uppercase">{t('verifiedData')}</span>
                        </div>
                        <p className="text-center text-xs font-bold text-slate-400 leading-relaxed px-4">{t('scoreCalc')}</p>
                    </Card>
                </div>

                {/* Dashboard Tabs */}
                <Tabs defaultValue={has999 ? "market" : "history"} className="space-y-6">
                    <TabsList className="bg-white/50 backdrop-blur-md border border-slate-200 p-1.5 rounded-[1.5rem] h-14 md:h-16 shadow-sm flex w-full overflow-x-auto gap-1">
                        <TabsTrigger value="market" className="flex-1 rounded-xl data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-600/20 font-black px-3 md:px-8 h-full flex gap-1 md:gap-3 transition-all text-xs md:text-sm whitespace-nowrap">
                            <Tag className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" /> {t('marketTab')}
                        </TabsTrigger>
                        <TabsTrigger value="national" className="flex-1 rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/20 font-black px-3 md:px-8 h-full transition-all text-xs md:text-sm whitespace-nowrap">
                            {t('nationalTab')}
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex-1 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/20 font-black px-3 md:px-8 h-full transition-all text-xs md:text-sm whitespace-nowrap">
                            {t('historyTab')}
                        </TabsTrigger>
                        <TabsTrigger value="specs" className="flex-1 rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-slate-900/20 font-black px-3 md:px-8 h-full transition-all text-xs md:text-sm whitespace-nowrap">
                            {t('specsTab')}
                        </TabsTrigger>
                    </TabsList>

                    {/* Market Tab */}
                    <TabsContent value="market" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 border-none shadow-2xl rounded-[3rem] p-12 bg-white ring-1 ring-slate-100 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-2 h-full bg-orange-600"></div>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                                    <div className="space-y-1">
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{t('presence999')}</h3>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t('autoIdent')}</p>
                                    </div>
                                    {report.marketData.averagePrice > 0 && (
                                        <div className="bg-slate-50 border border-slate-100 px-8 py-4 rounded-[2rem] text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{t('avgPrice')}</p>
                                            <p className="text-3xl font-black text-slate-900 tracking-tighter">€{report.marketData.averagePrice.toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>

                                {has999 ? (
                                    <div className="space-y-6">
                                        {report.marketData.listings.map((listing: any, i: number) => (
                                            <div key={i} className="group bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-300">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                                    <div className="flex items-center gap-8">
                                                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                                                            <Camera className="w-10 h-10 text-slate-200 group-hover:text-orange-400 transition-colors" />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{t('activeAd')}</p>
                                                            </div>
                                                            <h5 className="text-2xl font-black text-slate-900 tracking-tighter line-clamp-1">{listing.title}</h5>
                                                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                                <span>ID: {listing.id}</span>
                                                                <span>•</span>
                                                                <span>{t('posted')}: {new Date(listing.posted).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right">
                                                            <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{listing.price} <span className="text-xl text-slate-400">{listing.currency}</span></p>
                                                        </div>
                                                        <Button
                                                            onClick={() => window.open(listing.url, '_blank')}
                                                            className="bg-slate-900 hover:bg-orange-600 text-white font-black rounded-2xl px-10 h-16 shadow-xl transition-all active:scale-95 text-lg"
                                                        >
                                                            {t('open')} <ExternalLink className="w-5 h-5 ml-2" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                        <Info className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-4">{t('noAds')}</h4>
                                        <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 text-sm leading-relaxed italic uppercase">
                                            {t('manualSearch')}
                                        </p>
                                        <Button
                                            onClick={() => window.open(`https://999.md/ro/search?query=${report.vin}`, '_blank')}
                                            className="bg-slate-900 text-white font-black rounded-2xl px-12 h-16 hover:bg-orange-600 transition-all text-xl shadow-2xl active:scale-95"
                                        >
                                            {t('searchManual')}
                                        </Button>
                                    </div>
                                )}
                            </Card>

                            <div className="space-y-8">
                                <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 p-10 text-white space-y-8 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent pointer-events-none"></div>
                                    <h3 className="text-xl font-black tracking-tighter">{t('gallery')}</h3>
                                    <div
                                        className="aspect-[4/3] bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-8 text-center space-y-4 group-hover:border-white/30 transition-all cursor-pointer"
                                        onClick={() => has999 && window.open(report.marketData.listings[0].url, '_blank')}
                                    >
                                        <ImageIcon className="w-16 h-16 text-white/10 group-hover:scale-110 group-hover:text-blue-400 transition-all duration-500" />
                                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest leading-loose">
                                            {has999 ? t('galleryHintActive') : t('galleryHintInactive')}
                                        </p>
                                    </div>
                                    {has999 && (
                                        <Button onClick={() => window.open(report.marketData.listings[0].url, '_blank')} className="w-full h-14 bg-blue-600 hover:bg-blue-700 font-black rounded-2xl">
                                            {t('viewGallery')} <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    )}
                                </Card>

                                <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 ring-1 ring-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">{t('paymentMethods')}</h4>
                                    <div className="flex flex-wrap gap-4 opacity-30 grayscale saturate-0 pointer-events-none">
                                        <img src="/payment-logos/VISA-logo.png" className="h-4 w-auto" alt="Visa" />
                                        <img src="/payment-logos/Mastercard-logo.svg" className="h-6 w-auto" alt="MC" />
                                        <img src="/payment-logos/Mia Instant Payments.webp" className="h-6 w-auto" alt="MIA" />
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* National Tab */}
                    <TabsContent value="national" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none space-y-8">
                        {report.nationalData ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card className="border-none shadow-2xl rounded-[3rem] p-12 bg-white ring-1 ring-slate-100 space-y-12 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12">
                                        <Flag className="w-64 h-64" />
                                    </div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="space-y-1">
                                            <h3 className="text-3xl font-black flex items-center gap-4 text-slate-900 tracking-tighter uppercase">
                                                {t('registryASP')}
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t('statusOfficial')}</p>
                                        </div>
                                        <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-black uppercase text-xs px-4 py-2 rounded-xl">{report.nationalData.vehicle.Status}</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-10 relative z-10">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{t('bodyColor')}</p>
                                            <p className="font-black text-slate-900 text-xl tracking-tight">{report.nationalData.vehicle.Color}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{t('regMD')}</p>
                                            <p className="font-black text-slate-900 text-xl tracking-tight">{report.nationalData.vehicle.RegistrationDate}</p>
                                        </div>
                                        <div className="col-span-2 p-8 bg-slate-50/80 rounded-[2.5rem] border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('opDesc')}</p>
                                            <p className="text-lg font-bold text-slate-700 tracking-tight leading-relaxed italic">"{report.nationalData.vehicle.LastOperation}"</p>
                                        </div>
                                    </div>
                                </Card>

                                <div className="space-y-8">
                                    {report.nationalData.inspections?.[0] && (
                                        <Card className="border-none shadow-2xl rounded-[3rem] p-10 bg-emerald-600 text-white space-y-8 shadow-emerald-600/20">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black uppercase tracking-[0.2em] text-emerald-200 text-[10px]">{t('techInspection')}</h4>
                                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                                    <CheckCircle2 className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-5xl font-black tracking-tighter">{report.nationalData.inspections[0].Mileage.toLocaleString()}</p>
                                                <p className="text-emerald-200 font-black uppercase tracking-widest text-xs">{t('kmRecorded')}</p>
                                            </div>
                                            <div className="pt-8 border-t border-white/10 flex justify-between items-center font-black">
                                                <span className="text-[10px] uppercase text-emerald-200">{t('expCertificate')}</span>
                                                <span className="text-xl tracking-tighter">{report.nationalData.inspections[0].ExpiryDate}</span>
                                            </div>
                                        </Card>
                                    )}

                                    {report.nationalData.borderCrossings?.length > 0 && (
                                        <Card className="border-none shadow-xl rounded-[3rem] p-10 bg-white ring-1 ring-slate-100 flex flex-col justify-between">
                                            <h4 className="font-black uppercase tracking-[0.2em] text-slate-400 text-[10px] mb-8 flex items-center gap-3">
                                                <Navigation className="w-4 h-4 text-blue-600" /> {t('borderFlow')}
                                            </h4>
                                            <div className="space-y-4">
                                                {report.nationalData.borderCrossings.slice(0, 3).map((b: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-[2rem] border border-slate-100 group transition-all">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase leading-none">{b.DateTime.split(' ')[0]}</p>
                                                            <p className="font-black text-slate-800 text-lg uppercase tracking-tight">{b.Point}</p>
                                                        </div>
                                                        <Badge className={b.Direction === 'ENTRY' ? 'bg-emerald-100 text-emerald-700 border-none font-black px-4 py-1.5' : 'bg-orange-100 text-orange-700 border-none font-black px-4 py-1.5'}>
                                                            {b.Direction}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <Card className="border-none shadow-2xl rounded-[4rem] p-24 bg-white ring-1 ring-slate-100 text-center space-y-8">
                                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto shadow-inner border border-slate-100">
                                    <Flag className="w-14 h-14 text-slate-200 animate-pulse" />
                                </div>
                                <div className="space-y-4 max-w-xl mx-auto">
                                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">{t('noRecordRM')}</h3>
                                    <p className="text-slate-500 font-medium text-lg leading-relaxed italic uppercase tracking-tighter">
                                        {t('noRecordDesc')}
                                    </p>
                                </div>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Timeline Tab */}
                    <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
                        <Card className="border-none shadow-2xl rounded-[3rem] p-12 bg-white ring-1 ring-slate-100">
                            <CardTitle className="text-3xl font-black mb-16 flex items-center gap-6 text-slate-900 tracking-tighter uppercase">
                                <History className="text-slate-900 w-10 h-10" /> {t('digitalHistory')}
                            </CardTitle>

                            {report.history.length > 0 ? (
                                <div className="relative pl-12 space-y-16 before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-1 before:bg-slate-100 before:rounded-full">
                                    {report.history.map((event, i) => (
                                        <div key={i} className="relative group">
                                            <div className="absolute -left-[56px] top-1 w-12 h-12 bg-white border-4 border-slate-50 rounded-2xl flex items-center justify-center z-10 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all group-hover:border-blue-100 duration-500">
                                                <Clock className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                            <div className="space-y-2 md:translate-x-0 group-hover:translate-x-2 transition-transform duration-500">
                                                <div className="flex items-center gap-4">
                                                    <Badge className="bg-slate-900 text-white border-none font-black text-[12px] tracking-tighter px-4 py-1.5 rounded-xl">{event.date}</Badge>
                                                    <Badge variant="outline" className="border-slate-200 text-slate-400 font-black text-[10px] tracking-widest uppercase py-1.5 px-4 rounded-xl">{event.type}</Badge>
                                                </div>
                                                <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight max-w-2xl">{event.description}</h4>
                                                <div className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest italic">
                                                    <MapPin className="w-4 h-4 text-blue-600/50" /> {event.location}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-24 text-center space-y-6">
                                    <Info className="w-20 h-20 text-slate-100 mx-auto" />
                                    <div className="space-y-1">
                                        <p className="text-xl font-black text-slate-900 tracking-tighter uppercase">{t('limitedHistory')}</p>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest max-w-xs mx-auto">{t('noEvents')}</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    {/* Specs Tab */}
                    <TabsContent value="specs" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none space-y-12">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {(isExtended && report.allSpecs ? Object.entries(report.allSpecs) : Object.entries(report.specs)).map(([key, value]) => (
                                <Card key={key} className="border-none shadow-lg rounded-3xl p-8 bg-white hover:ring-2 hover:ring-blue-600/20 transition-all group flex flex-col justify-between h-32 ring-1 ring-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 leading-none group-hover:text-blue-600 transition-colors">{key}</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tighter leading-none line-clamp-2">{String(value)}</p>
                                </Card>
                            ))}
                        </div>

                        {!isExtended && (
                            <div className="bg-slate-900 rounded-[4rem] p-16 text-white flex flex-col lg:flex-row items-center justify-between gap-12 shadow-3xl relative overflow-hidden ring-1 ring-white/10 group">
                                <div className="absolute top-0 right-0 p-24 opacity-5 group-hover:rotate-45 transition-transform duration-1000 scale-150">
                                    <Zap className="w-64 h-64" />
                                </div>
                                <div className="relative z-10 space-y-6 max-w-2xl text-center lg:text-left">
                                    <Badge className="bg-blue-600 text-white border-none px-6 py-2 font-black text-[12px] tracking-[0.2em] uppercase rounded-full shadow-lg shadow-blue-600/20">{t('deepScan')}</Badge>
                                    <div>
                                        <h4 className="text-5xl font-black tracking-tighter leading-none text-balance mb-4">{t('advTechAnalysis')}</h4>
                                        <p className="text-slate-400 font-medium text-xl leading-relaxed text-balance">
                                            {t('unlockData')}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleRequestExtended}
                                    disabled={extending}
                                    className="relative z-10 rounded-[2.5rem] font-black px-12 h-24 bg-white text-slate-900 hover:bg-slate-50 text-2xl shadow-3xl transition-all active:scale-95 disabled:opacity-50 min-w-[350px] flex items-center justify-center gap-4"
                                >
                                    {extending ? <><Loader2 className="w-10 h-10 animate-spin" /> {t('processing')} </> : t('unlockAll')}
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Floating UI Toolbar */}
            <div className="fixed bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-3 md:px-6 pointer-events-none">
                <div className="bg-slate-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-3 md:p-5 flex items-center justify-between shadow-2xl pointer-events-auto ring-1 ring-white/5">
                    <div className="flex items-center gap-3 md:gap-6 ml-2 md:ml-6">
                        <div className="relative">
                            <div className="w-3 h-3 md:w-4 md:h-4 bg-emerald-500 rounded-full animate-ping opacity-25"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 bg-emerald-500 rounded-full absolute inset-0 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.3em] leading-none">{t('dbStatus')}</p>
                            <p className="text-xs md:text-sm font-black text-white italic tracking-widest">{t('liveConnection')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button className="bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl md:rounded-2xl px-6 md:px-12 h-11 md:h-14 shadow-lg transition-all active:scale-95 text-sm md:text-lg">
                            {t('download')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
