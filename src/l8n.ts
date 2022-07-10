import LocalizedStrings from "react-localization";

export const EnglishLanguageProperties: ILanguageProperties = {
    localeName: "en",
    friendlyName: "English",
    isRtl: false
};

export const ArabicLanguageProperties: ILanguageProperties = {
    localeName: "ar",
    friendlyName: "اللغة العربية",
    isRtl: true
};

export interface ILanguageProperties {
    localeName: string;
    friendlyName: string;
    isRtl: boolean;
}

export const strings = new LocalizedStrings({
    en: {
        "noContent": "The page you are looking for is not found. Please check the address and try again.",
        "switchLang": "اللغة العربية",
        "home": "Home",
        "seasons": "Seasons",
        "types": "Types",
        "tunes": "Tunes",
        "booklets": "Booklets",
        "fonts": "Fonts",
        "help": "Help",
        "contactUs": "Contact Us",
        "otherServices": "Other Services",
        "loading": "Loading...",
        "noSeasons": "No seasons to display",
        "followUs": "Follow Us",
        "menu": "Menu",
        "seasonTitle": "{0} Hymns"
    },
    ar: {
        "noContent": "الصفحة التي تبحث عنها غير موجودة. يرجى التحقق من العنوان ثم حاول مرة أخرى.",
        "switchLang": "English",
        "home": "الرئيسية",
        "seasons": "مواسم",
        "types": "أنواع",
        "tunes": "الأنغام",
        "booklets": "كتيبات",
        "fonts": "الخطوط",
        "help": "مساعدة",
        "contactUs": "الإتصال بنا",
        "otherServices": "خدمات أُخرى",
        "loading": "جار التحميل...",
        "noSeasons": "لا توجد مواسم للعرض",
        "followUs": "تابعنا",
        "menu": "القائمة",
        "seasonTitle": "الحان {0}"
    }
});
