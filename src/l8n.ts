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
        "noTypes": "No hymn types to display",
        "noTunes": "No hymn tunes to display",
        "followUs": "Follow Us",
        "menu": "Menu",
        "seasonTitle": "{0} Hymns",
        "textFormatName": "Text",
        "hazzatFormatName": "Hazzat",
        "verticalHazzatFormatName": "Vertical Hazzat",
        "musicFormatName": "Musical Notes",
        "audioFormatName": "Audio",
        "videoFormatName": "Video",
        "informationFormatName": "Information",
        "contentNotFoundMessage": "The content you are looking for cannot be found...",
        "goBack": "Go back",
        "musicalNotesLinkSuffix": "Musical Notes",
        "musicAudioLinkSuffix": "Instrumental Audio",
        "audioLinkSuffix": "Audio",
        "numeric0": "0",
        "numeric1": "1",
        "numeric2": "2",
        "numeric3": "3",
        "numeric4": "4",
        "numeric5": "5",
        "numeric6": "6",
        "numeric7": "7",
        "numeric8": "8",
        "numeric9": "9",

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
        "noTypes": "لا توجد أنواع للعرض",
        "noTunes": "لا توجد أنغام للعرض",
        "followUs": "تابعنا",
        "menu": "القائمة",
        "seasonTitle": "الحان {0}",
        "textFormatName": "نَص",
        "hazzatFormatName": "هزّات",
        "verticalHazzatFormatName": "هزّات أفقية",
        "musicFormatName": "نوتة موسيقية",
        "audioFormatName": "مَلفّ صوتي",
        "videoFormatName": "فيديو",
        "informationFormatName": "معلومات",
        "contentNotFoundMessage": "المحتوى الذي تبحث عنه غير موجود...",
        "goBack": "رجوع",
        "musicalNotesLinkSuffix": "نوتة موسيقية",
        "musicAudioLinkSuffix": "صوت آلي",
        "audioLinkSuffix": "مَلفّ صوتي",
        "numeric0": "٠",
        "numeric1": "١",
        "numeric2": "٢",
        "numeric3": "٣",
        "numeric4": "٤",
        "numeric5": "٥",
        "numeric6": "٦",
        "numeric7": "٧",
        "numeric8": "٨",
        "numeric9": "٩",
    }
});
