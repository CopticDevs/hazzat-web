import { useContext, useState } from "react";
import { UserSettingsContext } from "../Contexts/UserSettingsContext";
import { strings } from "../l8n";
import LocalizedMessage from "../LocalizedMessage";

interface IRadioOption {
    value: string;
    label: string;
}

function UserSettingsChanger() {
    const { userSettings, setHazzatFontColor, setContentFontColor, setContentFontSize } = useContext(UserSettingsContext);
    const [selectedHazzatColor, setSelectedHazzatColor] = useState(userSettings.hazzatFontColor);
    const [selectedContentColor, setSelectedContentColor] = useState(userSettings.contentFontColor);
    const [selectedFontSize, setSelectedFontSize] = useState<number>(18);

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
        <div>
            <form>
                <div className="container">
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
        </div>
    );
}

export default UserSettingsChanger;
