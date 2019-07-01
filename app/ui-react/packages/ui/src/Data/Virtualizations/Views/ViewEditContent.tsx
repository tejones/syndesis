import { Text, TextContent, Title, TitleLevel } from '@patternfly/react-core';
import { Alert, Button, Card } from 'patternfly-react';
import * as React from 'react';
import { Loader, PageSection } from '../../../Layout';
import { ITextEditor, TextEditor } from '../../../Shared';
import './ViewEditContent.css';

export interface IViewEditValidationResult {
  message: string;
  type: 'error' | 'success';
}

export interface IViewEditContentProps {
  viewDdl: string;

  /**
   * The localized text for the cancel button.
   */
  i18nCancelLabel: string;

  /**
   * The localized text for the content description.
   */
  i18nDescription: string;

  /**
   * The localized text for the save button.
   */
  i18nSaveLabel: string;

  /**
   * The localized text for the content title.
   */
  i18nTitle: string;

  /**
   * The localized text for the validate button.
   */
  i18nValidateLabel: string;

  /**
   * `true` if all form fields have valid values.
   */
  isValid: boolean;

  /**
   * `true` if the parent is doing some work and this form should disable user input.
   */
  isWorking: boolean;

  /**
   * View validationResults
   */
  validationResults: IViewEditValidationResult[];

  /**
   * The callback for when the save button is clicked
   * @param ddl the text area ddl
   */
  onSave: (ddl: string) => void;

  /**
   * The callback for when the validate button is clicked.
   * @param ddl the ddl
   */
  onValidate: (ddl: string) => void;

  /**
   * The callback for cancel editing
   */
  onCancel: () => void;
}

interface IViewEditContentState {
  ddlValue: string;
  initialDdlValue: string;
  needsValidation: boolean;
}

export class ViewEditContent extends React.Component<
  IViewEditContentProps,
  IViewEditContentState
> {
  public static defaultProps = {
    validationResults: [],
  };

  constructor(props: IViewEditContentProps) {
    super(props);
    this.state = {
      ddlValue: this.props.viewDdl,
      initialDdlValue: this.props.viewDdl,
      needsValidation: false,
    };
    this.handleDdlChange = this.handleDdlChange.bind(this);
    this.handleDdlValidation = this.handleDdlValidation.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  public handleDdlValidation = () => (event: any) => {
    this.props.onValidate(this.state.ddlValue);
    this.setState({
      needsValidation: false,
    });
  };

  public handleDdlChange(editor: ITextEditor, data: any, value: string) {
    this.setState({
      ddlValue: value,
      needsValidation: true,
    });
  }

  public handleSave = () => (event: any) => {
    const currentDdl = this.state.ddlValue;
    this.props.onSave(currentDdl);
  };

  public render() {
    const editorOptions = {
      autofocus: true,
      extraKeys: { 'Ctrl-Space': 'autocomplete' },
      gutters: ['CodeMirror-lint-markers'],
      // TODO: dynamically generate the table - column hints
      // hintOptions: {
      //   tables: {
      //     countries: ['name', 'population', 'size'],
      //     users: ['name', 'score', 'birthDate'],
      //   },
      // },
      lineNumbers: true,
      lineWrapping: true,
      matchBrackets: true,
      mode: 'text/x-mysql',
      readOnly: false,
      showCursorWhenSelecting: true,
      styleActiveLine: true,
      tabSize: 2,
    };
    return (
      <>
        <PageSection variant={'light'}>
          <TextContent>
            <Title size="2xl" headingLevel={TitleLevel.h1}>
              {this.props.i18nTitle}
            </Title>
            {this.props.i18nDescription && (
              <Text>{this.props.i18nDescription}</Text>
            )}
          </TextContent>
        </PageSection>
        <PageSection>
          <Card>
            <Card.Body>
              {this.props.validationResults.map((e, idx) => (
                <Alert key={idx} type={e.type}>
                  {e.message}
                </Alert>
              ))}
              <TextEditor
                value={this.state.initialDdlValue}
                options={editorOptions}
                onChange={this.handleDdlChange}
              />
              <Button
                bsStyle="default"
                disabled={this.props.isWorking || !this.state.needsValidation}
                onClick={this.handleDdlValidation()}
              >
                {this.props.isWorking ? (
                  <Loader size={'sm'} inline={true} />
                ) : null}
                {this.props.i18nValidateLabel}
              </Button>
            </Card.Body>
            <Card.Footer>
              <Button
                bsStyle="default"
                className="view-edit-content__editButton"
                disabled={this.props.isWorking}
                onClick={this.props.onCancel}
              >
                {this.props.i18nCancelLabel}
              </Button>
              <Button
                bsStyle="primary"
                className="view-edit-content__editButton"
                disabled={
                  this.props.isWorking ||
                  !this.props.isValid ||
                  this.state.needsValidation
                }
                onClick={this.handleSave()}
              >
                {this.props.i18nSaveLabel}
              </Button>
            </Card.Footer>
          </Card>
        </PageSection>
      </>
    );
  }
}
