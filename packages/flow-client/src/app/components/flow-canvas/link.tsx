import {
    DefaultLinkFactory,
    DefaultLinkModel,
    DefaultLinkProps,
    DefaultLinkWidget,
    GenerateWidgetEvent,
} from '@projectstorm/react-diagrams';

export class CustomLinkModel extends DefaultLinkModel {
    constructor() {
        super({
            type: 'custom',
            // Additional custom properties
        });
    }

    // Custom methods for handling proximity or compatibility checks
}

export interface CustomLinkProps extends DefaultLinkProps {
    link: CustomLinkModel;
    // Other props
}

export const CustomLinkWidget: React.FC<CustomLinkProps> = props => {
    // Custom rendering logic here
    return <DefaultLinkWidget {...props} />;
};

export class CustomLinkFactory extends DefaultLinkFactory {
    constructor() {
        super('custom'); // This type should match the type in your CustomLinkModel
    }

    generateModel(): CustomLinkModel {
        return new CustomLinkModel();
    }

    // If you have a custom widget, override generateReactWidget method
    generateReactWidget(
        event: GenerateWidgetEvent<CustomLinkModel>
    ): JSX.Element {
        return (
            <CustomLinkWidget link={event.model} diagramEngine={this.engine} />
        );
    }
}
