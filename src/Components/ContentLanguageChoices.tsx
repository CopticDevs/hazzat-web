import { contentLanguages } from "../ContentLanguages";
import { ContentLanguage } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import { strings } from "../l8n";
import "./ContentLanguageChoices.css";

export default function ContentLanguageChoices({ included, onChange, hint }: {
    included: ContentLanguage[]; onChange: (languages: ContentLanguage[]) => void; hint: string;
}) {
    return <fieldset className="content-language-settings"><legend>{strings.contentLanguages}</legend>
        <div className="content-language-choices">{contentLanguages.map(language => <label key={language}>
            <input type="checkbox" checked={included.includes(language)} onChange={event => onChange(contentLanguages.filter(value =>
                value === language ? event.target.checked : included.includes(value)))} />
            {language === ContentLanguage.English ? strings.languageEnglish : language === ContentLanguage.Coptic ? strings.languageCoptic : strings.languageArabic}
        </label>)}</div><p className="bookletHint">{hint}</p>
    </fieldset>;
}
