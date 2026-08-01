import { ComponentChildren } from "preact";
import { htmlToJsx } from "../../util/jsx";
import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../types";
import { CodexCollection, collectionForSlug } from "../CodexCollection";
import { HomePage } from "../HomePage";

const Content: QuartzComponent = (props: QuartzComponentProps) => {
  const { fileData, tree } = props;
  if (fileData.slug === "index") {
    return <HomePage {...props} />;
  }

  if (collectionForSlug(fileData.slug)) {
    return <CodexCollection {...props} />;
  }

  const content = htmlToJsx(fileData.filePath!, tree) as ComponentChildren;
  const classes: string[] = fileData.frontmatter?.cssclasses ?? [];
  const classString = ["popover-hint", ...classes].join(" ");
  return <article class={classString}>{content}</article>;
};

export default (() => Content) satisfies QuartzComponentConstructor;
