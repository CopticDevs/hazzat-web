import { useContext, useState } from "react";
import { UserSettingsContext } from "../Contexts/UserSettingsContext";
import { strings } from "../l8n";
import LocalizedMessage from "../LocalizedMessage";
import "./UserSettingsChanger.css";
import { Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { LanguageContext } from "../LanguageContext";

interface IRadioOption {
    value: string;
    label: string;
}

function UserSettingsChanger() {
    const { languageProperties } = useContext(LanguageContext);
    const { userSettings, setHazzatFontColor, setContentFontColor, setContentFontSize } = useContext(UserSettingsContext);
    const [selectedHazzatColor, setSelectedHazzatColor] = useState(userSettings.hazzatFontColor);
    const [selectedContentColor, setSelectedContentColor] = useState(userSettings.contentFontColor);
    const [expanded, setExpanded] = useState(false);
    const [selectedFontSize, setSelectedFontSize] = useState<number>(18);
    const langClassName = languageProperties.isRtl ? "position-fixed start-0 modal-toggle" : "position-fixed end-0 modal-toggle";
    const langDirName = languageProperties.isRtl ? "dirRtl" : "dirLtr";

    const handleToggleModal = () => {
        setExpanded(!expanded);
    };

    const overrideEnglishStyle = {
        '--english-font-size': userSettings.englishFontSize,
        '--content-font-color': userSettings.contentFontColor,
        '--hazzat-font-color': userSettings.hazzatFontColor,
        direction: 'ltr',
    } as React.CSSProperties & { '--english-font-size': string; '--content-font-color': string; '--hazzat-font-color': string; };

    const overrideArabicStyle = {
        '--arabic-font-size': userSettings.arabicFontSize,
        '--content-font-color': userSettings.contentFontColor,
        '--hazzat-font-color': userSettings.hazzatFontColor,
        direction: 'rtl',
    } as React.CSSProperties & { '--arabic-font-size': string; '--content-font-color': string; '--hazzat-font-color': string; };

    const options: IRadioOption[] = [
        { value: 'BLACK', label: strings.black },
        { value: 'GRAY', label: strings.gray },
        { value: 'MAROON', label: strings.maroon },
        { value: 'RED', label: strings.red },
        { value: 'NAVY', label: strings.navy },
        { value: 'BLUE', label: strings.blue },
    ];

    const handleHazzatColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedHazzatColor(event.target.value);
        setHazzatFontColor(event.target.value);
    };

    const handleContentColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedContentColor(event.target.value);
        setContentFontColor(event.target.value);
    };

    const handleTextSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const num = +event.target.value;
        setSelectedFontSize(num);
        setContentFontSize(num);
    };

    return (
        <>
            {!expanded &&
                <Button
                    onClick={handleToggleModal}
                    className={langClassName}
                    style={{ zIndex: 100, top: '20%' }}
                >
                    <FontAwesomeIcon icon={faCog} className="text-dark" />
                </Button>}
            <Modal show={expanded} onHide={handleToggleModal} animation={true} size="lg" className={langDirName}>
                <Modal.Header closeButton>
                    <Modal.Title><LocalizedMessage of="settings" /></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div className="container-fluid">
                            <div className="row">
                                <div><strong><LocalizedMessage of="textFormatName" /></strong></div>
                            </div>
                            <div className="row">
                                {options.map((option) => (
                                    <div key={`content${option.value}`} className="col-6 col-md-2">
                                        <label className="form-check-label" htmlFor={`content${option.value}`}>
                                            <input
                                                className="form-check-input"
                                                name="contentFontColor"
                                                id={`content${option.value}`}
                                                type="radio"
                                                value={option.value}
                                                checked={selectedContentColor === option.value}
                                                onChange={handleContentColorChange}
                                            />
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="row" style={{ paddingTop: "10px" }}>
                                <div><strong><LocalizedMessage of="hazzatFormatName" /></strong></div>
                            </div>
                            <div className="row">
                                {options.map((option) => (
                                    <div key={`hazzat${option.value}`} className="col-6 col-md-2">
                                        <label className="form-check-label" htmlFor={`hazzat${option.value}`}>
                                            <input
                                                className="form-check-input"
                                                name="hazzatFontColor"
                                                id={`hazzat${option.value}`}
                                                type="radio"
                                                value={option.value}
                                                checked={selectedHazzatColor === option.value}
                                                onChange={handleHazzatColorChange}
                                            />
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="row" style={{ paddingTop: "10px" }}>
                                <div><strong><LocalizedMessage of="size" /></strong></div>
                            </div>
                            <div className="row">
                                <input
                                    type="range"
                                    className="form-range"
                                    id="sizeRange"
                                    name="range-control"
                                    min="10"
                                    max="26"
                                    step="2"
                                    value={selectedFontSize}
                                    onChange={handleTextSizeChange}
                                />
                            </div>
                        </div>
                    </form>                    
                    <div className="m-4">
                        <Modal.Title as="h5"><LocalizedMessage of="sample" /></Modal.Title>
                        <div className="border p-4 m-4">
                            <div style={overrideEnglishStyle} dangerouslySetInnerHTML={{ __html: strings.sampleCoptic }} />
                            <div style={overrideEnglishStyle} dangerouslySetInnerHTML={{ __html: strings.sampleEnglish }} />
                            <div style={overrideArabicStyle} dangerouslySetInnerHTML={{ __html: strings.sampleArabic }} />
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default UserSettingsChanger;
