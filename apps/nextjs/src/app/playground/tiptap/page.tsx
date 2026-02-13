"use client";

import { Button } from "@nucleus/ui/components/button";
import { RichTextEditor } from "@nucleus/ui/components/rich-text-editor";
import * as React from "react";

export default function PlaygroundPage() {
  const [value, setValue] = React.useState(
    "<p>Hello <strong>world</strong>! Try editing this content.</p>"
  );
  const [output, setOutput] = React.useState(value);

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8">
      <h1 className="text-2xl font-bold">Rich Text Editor Playground</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Controlled</h2>
        <RichTextEditor
          value={value}
          onChange={(v) => {
            setValue(v);
            setOutput(v);
          }}
          placeholder="Type here..."
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Uncontrolled (defaultValue)</h2>
        <RichTextEditor
          defaultValue="<p>This editor uses <em>defaultValue</em> only.</p>"
          onChange={(v) => setOutput(v)}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Disabled</h2>
        <RichTextEditor value="<p>This editor is <u>disabled</u>.</p>" disabled />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">HTML Output</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setValue("");
              setOutput("");
            }}
          >
            Reset
          </Button>
        </div>
        <pre className="max-h-60 overflow-auto rounded-md border bg-muted p-3 text-xs">
          {output}
        </pre>
      </section>
    </div>
  );
}
