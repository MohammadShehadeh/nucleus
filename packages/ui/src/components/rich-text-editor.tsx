"use client";

import { Button } from "@nucleus/ui/components/button";
import { Input } from "@nucleus/ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@nucleus/ui/components/popover";
import { Separator } from "@nucleus/ui/components/separator";
import { Skeleton } from "@nucleus/ui/components/skeleton";
import { Toggle } from "@nucleus/ui/components/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@nucleus/ui/components/tooltip";
import { cn } from "@nucleus/ui/lib/utils";
import { Extension } from "@tiptap/core";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo,
  Strikethrough,
  Trash2,
  UnderlineIcon,
  Undo,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface RichTextEditorProps {
  /** Current HTML value (controlled) */
  value?: string;
  /** Called with updated HTML whenever the content changes */
  onChange?: (value: string) => void;
  /** Initial HTML content used when the editor first mounts */
  defaultValue?: string;
  /** Placeholder text shown when the editor is empty */
  placeholder?: string;
  /** Whether the editor is editable */
  editable?: boolean;
  /** Whether the editor is disabled (alias for !editable, matches form semantics) */
  disabled?: boolean;
  /** Additional class names for the outer wrapper */
  className?: string;
  /** Name attribute – unused by the editor itself but kept for form compat */
  name?: string;
  /** Called when the editor receives focus */
  onFocus?: () => void;
  /** Called when the editor loses focus */
  onBlur?: () => void;
}

const fakeSelectionPluginKey = new PluginKey("fakeSelection");

const SelectionHighlight = Extension.create({
  name: "selectionHighlight",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: fakeSelectionPluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply: (tr, old) => {
            const meta = tr.getMeta(fakeSelectionPluginKey) as
              | { from: number; to: number }
              | "clear"
              | undefined;
            if (meta === "clear") return DecorationSet.empty;
            if (meta) {
              const deco = Decoration.inline(meta.from, meta.to, {
                class: "fake-selection",
              });
              return DecorationSet.create(tr.doc, [deco]);
            }
            return old.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

function showFakeSelection(editor: Editor) {
  const { from, to } = editor.state.selection;
  if (from === to) return; // no range selected
  editor.view.dispatch(editor.state.tr.setMeta(fakeSelectionPluginKey, { from, to }));
}

function clearFakeSelection(editor: Editor) {
  editor.view.dispatch(editor.state.tr.setMeta(fakeSelectionPluginKey, "clear"));
}

interface ToolbarButtonProps {
  tooltip: string;
  pressed: boolean;
  onPressedChange: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

function ToolbarButton({
  tooltip,
  pressed,
  onPressedChange,
  disabled,
  children,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle size="sm" pressed={pressed} onPressedChange={onPressedChange} disabled={disabled}>
          {children}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="top">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function LinkPopover({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      const existing = editor.getAttributes("link").href as string | undefined;
      setUrl(existing ?? "");
      showFakeSelection(editor);
    } else {
      clearFakeSelection(editor);
    }
    setOpen(nextOpen);
  };

  const applyLink = () => {
    clearFakeSelection(editor);
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    }
    setOpen(false);
  };

  const removeLink = () => {
    clearFakeSelection(editor);
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("link")}
              onPressedChange={() => handleOpen(!open)}
            >
              <LinkIcon className="size-4" />
            </Toggle>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">Link</TooltipContent>
      </Tooltip>

      <PopoverContent
        className="w-80 p-3"
        align="start"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            applyLink();
          }}
        >
          <Input
            ref={inputRef}
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-8 text-sm"
          />
          <Button type="submit" variant="ghost" size="icon-sm">
            <Check className="size-4" />
          </Button>
          {editor.isActive("link") && (
            <Button type="button" variant="ghost" size="icon-sm" onClick={removeLink}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <TooltipProvider>
      <div
        data-slot="rich-text-editor-toolbar"
        className="flex flex-wrap items-center gap-0.5 border-b border-border p-1"
      >
        <ToolbarButton
          tooltip="Undo"
          pressed={false}
          onPressedChange={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Redo"
          pressed={false}
          onPressedChange={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          tooltip="Paragraph"
          pressed={editor.isActive("paragraph")}
          onPressedChange={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Heading 1"
          pressed={editor.isActive("heading", { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Heading 2"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Heading 3"
          pressed={editor.isActive("heading", { level: 3 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          tooltip="Bold"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Italic"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Underline"
          pressed={editor.isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Strikethrough"
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Code"
          pressed={editor.isActive("code")}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Highlight"
          pressed={editor.isActive("highlight")}
          onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <LinkPopover editor={editor} />

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          tooltip="Align left"
          pressed={editor.isActive({ textAlign: "left" })}
          onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Align center"
          pressed={editor.isActive({ textAlign: "center" })}
          onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Align right"
          pressed={editor.isActive({ textAlign: "right" })}
          onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Justify"
          pressed={editor.isActive({ textAlign: "justify" })}
          onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          tooltip="Bullet list"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Ordered list"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Blockquote"
          pressed={editor.isActive("blockquote")}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="Horizontal rule"
          pressed={false}
          onPressedChange={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="size-4" />
        </ToolbarButton>
      </div>
    </TooltipProvider>
  );
}

function RichTextEditor({
  value,
  onChange,
  defaultValue = "",
  placeholder = "Write something...",
  editable = true,
  disabled = false,
  className,
  onFocus,
  onBlur,
}: RichTextEditorProps) {
  const isEditable = editable && !disabled;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2 hover:text-primary/80",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Highlight.configure({ multicolor: false }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      SelectionHighlight,
    ],
    content: value ?? defaultValue,
    editable: isEditable,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML());
    },
    onFocus: () => onFocus?.(),
    onBlur: () => onBlur?.(),
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[150px] px-3 py-2 text-base md:text-sm",
      },
    },
  });

  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor && editor.isEditable !== isEditable) {
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor]);

  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      isInternalUpdate.current = true;
    };
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor]);

  if (!editor) {
    return (
      <div
        data-slot="rich-text-editor"
        className={cn("border-input rounded-md border bg-transparent shadow-xs grow", className)}
      >
        <div className="flex items-center gap-2 border-b border-border p-2 flex-wrap">
          {Array.from({ length: 21 }).map((_, i) => (
            <Skeleton key={`skel-${i}`} className="size-7 rounded aspect-square" />
          ))}
        </div>
        <div className="space-y-2.5 px-3 py-3 min-h-[150px]">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot="rich-text-editor"
      className={cn(
        "border-input focus-within:border-ring focus-within:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] focus-within:ring-[3px]",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {isEditable && <Toolbar editor={editor} />}
      <div className="tiptap-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export { RichTextEditor, type RichTextEditorProps };
