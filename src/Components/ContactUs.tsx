import { useContext, useState } from "react";
import { strings } from "../l8n";
import LocalizedMessage from "../LocalizedMessage";
import HymnTitle from "./HymnTitle";
import MainPaper, { Size } from "./MainPaper";
import "./ContactUs.css";
import { LanguageContext } from "../LanguageContext";

interface IFormErrors {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
}

function ContactUs() {
    const { languageProperties } = useContext(LanguageContext);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<IFormErrors>({});
    const langClassName = languageProperties.isRtl ? "fRight" : "fLeft";

    const handleSubmit = (e: any) => {
        e.preventDefault();
        // Validate form data
        const errors = validateForm();
        if (Object.keys(errors).length === 0) {
            // Send form data to server or email using a library or API
            submitForm(name, email, subject, message);
            // Show confirmation message
            setSubmitted(true);
        } else {
            // Show validation errors
            setErrors(errors);
        }
    };

    const submitForm = async (name: string, email: string, subject: string, message: string) => {
        console.log(name, email, subject, message);
    };

    const validateForm = () => {
        let errors: IFormErrors = {};
        if (name.trim() === '') {
            errors.name = strings.nameRequiredErrorText;
        }
        if (email.trim() === '') {
            errors.email = strings.emailRequiredErrorText;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = strings.emailInvalidErrorText;
        }
        if (subject.trim() === '') {
            errors.subject = strings.subjectRequiredErrorText;
        }
        if (message.trim() === '') {
            errors.message = strings.messageRequiredErrorText;
        }
        return errors;
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setSubmitted(false);
        setErrors({});
    };

    if (submitted) {
        return (
            <MainPaper size={Size.Wide}>
                <div className="pageTitle"><LocalizedMessage of="contactUs" /></div>
                <div>
                    <h2><LocalizedMessage of="feedbackThankYouMessage" /></h2>
                    <p><LocalizedMessage of="feedbackGetBackMessage" /></p>
                    <button className="btn btn-primary" onClick={resetForm}><LocalizedMessage of="feedbackSubmitAnotherMessage" /></button>
                </div>
        </MainPaper>
        );
    }

    // fix according to https://getbootstrap.com/docs/4.3/components/forms/ and localize the above

    return (
        <MainPaper size={Size.Wide}>
            <div className="pageTitle"><LocalizedMessage of="contactUs" /></div>

            <form onSubmit={handleSubmit}>
                <div className="container">
                    <div className={langClassName} style={{ paddingBottom: "20px", paddingTop: "20px" }}>
                        <HymnTitle content={strings.yourContactInfo} />
                    </div>
                    <div className="clear" />
                    <div className="row">
                        <label>
                            <div className="col-3 col-md-4">
                                <LocalizedMessage of="nameFormLabel" />
                            </div>
                            <div className="col-9 col-md-8">
                                <input className={errors.name ? 'form-control is-invalid' : 'form-control'} type="text" value={name} onChange={(e) => setName(e.target.value)} />
                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                            </div>
                        </label>
                    </div>
                    <div className="row">
                        <label>
                            <div className="col-3 col-md-4">
                                <LocalizedMessage of="emailFormLabel" />
                            </div>
                            <div className="col-9 col-md-8">
                                <input className={errors.email ? 'form-control is-invalid' : 'form-control'} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>
                        </label>
                    </div>
                </div>

                <div className="container" style={{ paddingTop: "33px" }}>
                    <div className={langClassName} style={{ paddingBottom: "20px", paddingTop: "20px" }}>
                        <HymnTitle content={strings.yourFeedback} />
                    </div>
                    <div className="clear" />
                    <div className="row">
                        <label>
                            <div className="col-3 col-md-4">
                                <LocalizedMessage of="subjectFormLabel" />
                            </div>
                            <div className="col-9 col-md-8">
                                <input className={errors.subject ? 'form-control is-invalid' : 'form-control'} type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
                                {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
                            </div>
                        </label>
                    </div>
                    
                    <div className="row">
                        <label>
                            <div className="col-3 col-md-4">
                                <LocalizedMessage of="messageFormLabel" />
                            </div>
                            <div className="col-9 col-md-8">
                                <textarea className={errors.message ? 'form-control is-invalid' : 'form-control'} value={message} onChange={(e) => setMessage(e.target.value)} />
                                {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                            </div>
                        </label>
                    </div>
                    <div className="row" style={{ paddingTop: "33px" }}>
                        <div className="col-3 col-md-4" >
                            <button className="btn btn-primary" type="submit"><LocalizedMessage of="submitFormLabel" /></button>
                        </div>
                    </div>
                </div>
            </form>
        </MainPaper>
    );
}

export default ContactUs;
