/**
 * Copyright © 2019 Johnson & Johnson
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { HTMLProps, FC } from 'react';
import { graphql } from 'gatsby';

import { observer } from 'mobx-react-lite';
import { flow } from 'lodash';
import {
  flowIf, hasProp, addClasses, withoutProps, StylableProps,
} from '@bodiless/fclasses';
import { Div } from '@bodiless/ui';
import {
  TMenuOptionGetter,
  ContextProvider,
  withNode,
  useNodeDataHandlers,
  useEditContext,
  contextMenuForm,
  getUI,
  LocalContextMenu,
  ContextWrapper,
  ContextWrapperProps,
} from '@bodiless/core';
import { Editable, Link, Image } from '@bodiless/components';
import { Page } from '@bodiless/gatsby-theme-bodiless';

import Layout from '../../../components/Layout';

type Values = { text: string };
const demoForm = (text: string) => contextMenuForm<Values>({
  initialValues: { text },
  // eslint-disable-next-line no-console
  submitValues: (values: Values) => console.log(values.text),
})(
  ({ ui }) => {
    const { ComponentFormLabel, ComponentFormText } = getUI(ui);
    return (
      <>
        <ComponentFormLabel htmlFor="left-form-txt">{text}</ComponentFormLabel>
        <ComponentFormText field="text" id="left-form-txt" />
      </>
    );
  },
);

const LeftForm = demoForm('Menu option provided by left box');
const TopForm = demoForm('Menu Option provided by outer box');
const RightForm = demoForm('Menu option provided by right box');

const topOptions = () => [
  {
    icon: 'keyboard_arrow_up',
    name: 'top',
    isActive: () => true,
    handler: () => TopForm,
    local: true,
  },
];
const leftOptions = () => [
  {
    icon: 'keyboard_arrow_left',
    name: 'home',
    isActive: () => true,
    handler: () => LeftForm,
    local: true,
    global: false,
  },
];

const rightOptions = () => [
  {
    icon: 'keyboard_arrow_right',
    name: 'home',
    isActive: () => true,
    handler: () => RightForm,
    local: true,
  },
];

type BoxProps = {
  getMenuOptions?: TMenuOptionGetter;
  name: string;
} & HTMLProps<HTMLDivElement>;

const emptyMenuOptionsGetter: TMenuOptionGetter = () => [];

type VariantProps = {
  isActive?: boolean;
};

const ui = {
  ContextWrapper: flow(
    withoutProps<VariantProps>(['isActive']),
    addClasses('border border-blue m-2 p-2').flow,
    flowIf(hasProp('isActive'))(
      addClasses('border-red').removeClasses('border-blue'),
    ),
  )(Div),
};

// const DemoContextWrapperDiv = flow(
//   removeClasses('border-transparent').addClasses('border-blue m-2 p-2'),
//   flowIf(hasProp('isActive'))(
//     removeClasses('border-blue').flow,
//   ),
// )(ContextWrapper);

const DemoContextWrapper: FC<StylableProps & ContextWrapperProps> = props => (
  <ContextWrapper {...props} ui={ui} />
);

const StaticBox: React.FC<HTMLProps<HTMLDivElement>> = ({
  children,
  className,
}) => (
  <DemoContextWrapper className={className} clickable>
    {children}
  </DemoContextWrapper>
);
const EditableBox: React.FC<BoxProps> = ({
  getMenuOptions,
  name,
  children,
  className,
}) => (
  <ContextProvider
    getMenuOptions={getMenuOptions || emptyMenuOptionsGetter}
    name={name}
  >
    <LocalContextMenu>
      <StaticBox className={className}>{children}</StaticBox>
    </LocalContextMenu>
  </ContextProvider>
);
const Box: React.FC<BoxProps> = observer(props => {
  const { isEdit } = useEditContext();
  return isEdit ? <EditableBox {...props} /> : <StaticBox {...props} />;
});

const BasicTest = () => (
  <Box
    name="Outer"
    getMenuOptions={topOptions}
    className="flex w-3/4 flex-wrap"
  >
    <div className="w-full">Outer Box</div>
    <Box getMenuOptions={leftOptions} name="left" className="flex-1">
      Left Box&nbsp;
      <Link nodeKey="linkit">This is an editable Nodelink.</Link>
      <Editable nodeKey="test" placeholder="bob" />
      <Link nodeKey="test2"><Editable nodeKey="text2text" placeholder="link me!" /></Link>
    </Box>
    <Box getMenuOptions={rightOptions} name="left" className="flex-1">
      <Image nodeKey="imageit" />
      <Image nodeKey="imageit2" />
      Right Box
    </Box>
  </Box>
);

// const ImageTest = ({ node }: TestProps) => (
//   <Box name="Outer" getMenuOptions={topOptions} className="flex w-3/4 flex-wrap">
//     <div className="w-full">
//       Outer Box
//     </div>
//     <Box getMenuOptions={leftOptions} name="left" className="flex-1">
//       Left Box
//     </Box>
//     <Box getMenuOptions={rightOptions} name="left" className="flex-1">
//       Right Box
//     </Box>
//   </Box>
// );

const NV1: FC<any> = withNode(
  observer(() => {
    const { componentData } = useNodeDataHandlers();
    return (
      <div>
        NodeLink Data:
        {JSON.stringify(componentData)}
      </div>
    );
  }),
);

export default (props: any) => (
  <Page {...props}>
    <Layout>
      <h1 className="text-3xl font-bold">This is a test page for edit context it really is </h1>
      <BasicTest />
      <NV1 nodeKey="linkit" />
      <NV1 nodeKey="imageit" />
      <NV1 nodeKey="imageit2" />
      <NV1 nodeKey="test" />
      <NV1 nodeKey="test2" />
      <NV1 nodeKey="test2text" />
      {/* <ImageTest node={root.child('image')} /> */}
    </Layout>
  </Page>
);

export const query = graphql`
  query($slug: String!) {
    ...PageQuery
    ...SiteQuery
  }
`;
