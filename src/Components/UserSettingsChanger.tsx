import { faCog, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { AppSettings } from "../AppSettings";
import { readerColor, UserSettingsContext } from "../Contexts/UserSettingsContext";
import { LanguageContext } from "../LanguageContext";
import { strings } from "../l8n";
import "./UserSettingsChanger.css";

export default function UserSettingsChanger() {
    const { languageProperties } = useContext(LanguageContext);
    const { userSettings, setHazzatFontColor, setContentFontColor, setContentFontSize } = useContext(UserSettingsContext);
    const [expanded, setExpanded] = useState(false);
    const size = parseFloat(userSettings.englishFontSize) || 18;
    const options = [{ value: "BLACK", label: strings.black }, { value: "MAROON", label: strings.maroon }, { value: "NAVY", label: strings.navy }];
    const sampleStyle = { '--english-font-size': userSettings.englishFontSize, '--content-font-color': readerColor(userSettings.contentFontColor), '--hazzat-font-color': readerColor(userSettings.hazzatFontColor) } as React.CSSProperties;
    return <>
        <Button className="reader-tool" variant="light" aria-label={strings.settings} onClick={() => {
            setExpanded(true); window.gtag?.("event", "button_click", { event_category: "Engagement", event_label: "Customization Button Clicked" });
        }}><FontAwesomeIcon icon={faCog} /></Button>
        <Modal animation={false} show={expanded} onHide={() => setExpanded(false)} aria-labelledby="reader-settings-title" className={languageProperties.isRtl ? "dirRtl" : "dirLtr"}>
            <Modal.Header closeButton closeLabel={strings.close}><Modal.Title id="reader-settings-title">{strings.settings}</Modal.Title></Modal.Header>
            <Modal.Body className="reader-settings">
                <fieldset><legend>{strings.size}</legend>
                    <div className="reader-size-controls">
                        <Button variant="light" className="size-button" aria-label={strings.decreaseTextSize} disabled={size <= AppSettings.minContentTextSize}
                            onClick={() => setContentFontSize(Math.max(AppSettings.minContentTextSize, size - 2))}><FontAwesomeIcon icon={faMinus} /></Button>
                        <div className="reader-size-sample" aria-label={strings.sample} dir="ltr" style={sampleStyle} dangerouslySetInnerHTML={{ __html: strings.sampleCopticShort }} />
                        <Button variant="light" className="size-button" aria-label={strings.increaseTextSize} disabled={size >= AppSettings.maxContentTextSize}
                            onClick={() => setContentFontSize(Math.min(AppSettings.maxContentTextSize, size + 2))}><FontAwesomeIcon icon={faPlus} /></Button>
                    </div>
                </fieldset>
                {[{ name: 'text', title: strings.textFormatName, selected: userSettings.contentFontColor, set: setContentFontColor },
                    { name: 'hazzat', title: strings.hazzatFormatName, selected: userSettings.hazzatFontColor, set: setHazzatFontColor }].map(group => <fieldset key={group.name}>
                    <legend>{group.title}</legend><div className="reader-colors">
                        {options.map(option => <label className="reader-color" key={option.value}>
                            <input type="radio" name={`reader-${group.name}-color`} value={option.value} checked={group.selected === option.value} onChange={() => group.set(option.value)} />
                            <span className="reader-color-swatch" style={{ backgroundColor: readerColor(option.value) }} aria-hidden="true" /><span>{option.label}</span>
                        </label>)}
                    </div>
                </fieldset>)}
            </Modal.Body>
        </Modal>
    </>;
}
