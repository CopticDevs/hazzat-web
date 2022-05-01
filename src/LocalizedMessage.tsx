import { strings } from './l8n';
import { LanguageContext } from './LanguageContext';

interface IProps {
    of: keyof typeof strings;
}

function LocalizedMessage(props: IProps) {
    const { of } = props
    const stringResouces: any = strings;

    return (
        <LanguageContext.Consumer>
            {({ language }) => {
                strings.setLanguage(language)
                return stringResouces[of]
            }}
        </LanguageContext.Consumer>
    )
}

export default LocalizedMessage
