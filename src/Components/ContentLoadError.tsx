import { useContext } from "react";
import { LanguageContext } from "../LanguageContext";

export default function ContentLoadError({ retry }: { retry: () => void }) {
    const { languageProperties } = useContext(LanguageContext);
    const arabic = languageProperties.localeName === "ar";
    return <div role="alert" className="alert alert-danger">
        <p>{arabic ? "تعذر تحميل المحتوى بالكامل. يرجى المحاولة مرة أخرى." : "The complete content could not be loaded. Please try again."}</p>
        <button type="button" className="btn btn-outline-danger" onClick={retry}>{arabic ? "إعادة المحاولة" : "Retry"}</button>
    </div>;
}
