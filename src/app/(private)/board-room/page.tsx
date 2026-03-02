"use client";

import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { DefaultChatTransport, type ToolUIPart } from "ai";

import {
  Attachment,
  AttachmentData,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { SpeechInput } from "@/components/ai-elements/speech-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { CheckIcon, GlobeIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useChat } from "@ai-sdk/react";

interface MessageType {
  key: string;
  from: "user" | "assistant";
  sources?: { href: string; title: string }[];
  versions: {
    id: string;
    content: string;
  }[];
  reasoning?: {
    content: string;
    duration: number;
  };
  tools?: {
    name: string;
    description: string;
    status: ToolUIPart["state"];
    parameters: Record<string, unknown>;
    result: string | undefined;
    error: string | undefined;
  }[];
}

const models = [
  {
    chef: "Groq",
    chefSlug: "groq",
    id: "llama3-8b-8192",
    name: "Llama 3 8B",
    providers: ["groq"],
  },
  {
    chef: "Groq",
    chefSlug: "groq",
    id: "llama3-70b-8192",
    name: "Llama 3 70B",
    providers: ["groq"],
  },
  {
    chef: "Groq",
    chefSlug: "groq",
    id: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B",
    providers: ["groq"],
  },
  {
    chef: "Groq",
    chefSlug: "groq",
    id: "gemma-7b-it",
    name: "Gemma 7B IT",
    providers: ["groq"],
  },
  {
    chef: "Groq",
    chefSlug: "groq",
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B",
    providers: ["groq"],
  },
  {
    chef: "Groq",
    chefSlug: "groq",
    id: "llama-3.1-70b-versatile",
    name: "Llama 3.1 70B",
    providers: ["groq"],
  },
  {
    chef: "Groq",
    chefSlug: "groq",
    id: "llama-3.2-11b-vision-preview",
    name: "Llama 3.2 11B Vision",
    providers: ["groq"],
  },
  {
    chef: "Groq",
    chefSlug: "groq",
    id: "llama-3.2-90b-vision-preview",
    name: "Llama 3.2 90B Vision",
    providers: ["groq"],
  },
  {
    chef: "Groq",
    chefSlug: "groq",
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    providers: ["groq"],
  },
];

const suggestions = [
  "What are the latest trends in AI?",
  "How does machine learning work?",
  "Explain quantum computing",
  "Best practices for React development",
  "Tell me about TypeScript benefits",
  "How to optimize database queries?",
  "What is the difference between SQL and NoSQL?",
  "Explain cloud computing basics",
];

const AttachmentItem = ({
  attachment,
  onRemove,
}: {
  // Use a generic type that covers both what `usePromptInputAttachments` provides and what might optionally be `FileUIPart`
  attachment: {
    id: string;
    name?: string;
    type?: string;
    url?: string;
    mediaType?: string;
  };
  onRemove: (id: string) => void;
}) => {
  const handleRemove = useCallback(() => {
    onRemove(attachment.id);
  }, [onRemove, attachment.id]);

  // Map the local attachment to the expected AttachmentData format
  const attachmentData = {
    id: attachment.id,
    type: "file" as const,
    url: attachment.url,
    mediaType: attachment.type,
    name: attachment.name, // Local custom attribute if needed
  } as unknown as AttachmentData;

  return (
    <Attachment data={attachmentData} onRemove={handleRemove}>
      <AttachmentPreview />
      <AttachmentRemove />
    </Attachment>
  );
};

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();

  const handleRemove = useCallback(
    (id: string) => {
      attachments.remove(id);
    },
    [attachments],
  );

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <AttachmentItem
          attachment={attachment}
          key={attachment.id}
          onRemove={handleRemove}
        />
      ))}
    </Attachments>
  );
};

const SuggestionItem = ({
  suggestion,
  onClick,
}: {
  suggestion: string;
  onClick: (suggestion: string) => void;
}) => {
  const handleClick = useCallback(() => {
    onClick(suggestion);
  }, [onClick, suggestion]);

  return <Suggestion onClick={handleClick} suggestion={suggestion} />;
};

const ModelItem = ({
  m,
  isSelected,
  onSelect,
}: {
  m: (typeof models)[0];
  isSelected: boolean;
  onSelect: (id: string) => void;
}) => {
  const handleSelect = useCallback(() => {
    onSelect(m.id);
  }, [onSelect, m.id]);

  return (
    <ModelSelectorItem onSelect={handleSelect} value={m.id}>
      <ModelSelectorLogo provider={m.chefSlug} />
      <ModelSelectorName>{m.name}</ModelSelectorName>
      <ModelSelectorLogoGroup>
        {m.providers.map((provider) => (
          <ModelSelectorLogo key={provider} provider={provider} />
        ))}
      </ModelSelectorLogoGroup>
      {isSelected ? (
        <CheckIcon className="ml-auto size-4" />
      ) : (
        <div className="ml-auto size-4" />
      )}
    </ModelSelectorItem>
  );
};

const BoardRoom = () => {
  const [model, setModel] = useState<string>(models[8].id); // Default to Llama 3.3 70B
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);

  const [input, setInput] = useState("");

  const {
    messages: chatSdkMessages,
    status,
    sendMessage,
    error,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        model,
        webSearch: useWebSearch,
      },
    }),

    onError: (err) => {
      toast.error("An error occurred during chat", {
        description: err.message,
      });
    },
  });

  const selectedModelData = useMemo(
    () => models.find((m) => m.id === model),
    [model],
  );

  const displayMessages = useMemo<MessageType[]>(() => {
    return chatSdkMessages.map((msg) => {
      // Extract text content from parts
      const textContent = Array.isArray(msg.parts)
        ? msg.parts
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("")
        : (msg as any).content || "";

      return {
        key: msg.id,
        from: msg.role === "user" ? "user" : "assistant",
        versions: [
          {
            id: msg.id,
            content: textContent,
          },
        ],
        // For reasoning we can try to extract it from parts if it exists, roughly
        reasoning: undefined, // Add parsing if needed
      };
    });
  }, [chatSdkMessages]);

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }

      try {
        if (message.files?.length) {
          toast.success("Files attached", {
            description: `${message.files.length} file(s) attached to message`,
          });
        }

        const attachments = message.files?.map((file) => file.url) || [];

        await sendMessage({
          text: message.text || "Sent with attachments",
          // Adding attachments to ai sdk message if they are required
          // Note: In a real app we would want to upload these first and pass URLs or send File objects
        });
        setInput("");
      } catch (err) {
        toast.error("Failed to send message", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    },
    [sendMessage],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      sendMessage({
        text: suggestion,
      }).catch((err: Error) => {
        toast.error("Failed to send suggestion", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      });
    },
    [sendMessage],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [],
  );

  const handleTranscriptionChange = useCallback(
    (transcript: string) => {
      handleInputChange({
        target: { value: input ? `${input} ${transcript}` : transcript },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    },
    [handleInputChange, input],
  );

  const toggleWebSearch = useCallback(() => {
    setUseWebSearch((prev) => !prev);
  }, []);

  const handleModelSelect = useCallback((modelId: string) => {
    setModel(modelId);
    setModelSelectorOpen(false);
  }, []);

  const isStreaming = status === "submitted" || status === "streaming";

  const isSubmitDisabled = useMemo(
    () => !(input.trim() || isStreaming) || status === "streaming",
    [input, isStreaming, status],
  );

  return (
    <div className="relative flex size-full flex-col divide-y overflow-hidden">
      <Conversation>
        <ConversationContent>
          {displayMessages.map(({ versions, ...message }) => (
            <MessageBranch defaultBranch={0} key={message.key}>
              <MessageBranchContent>
                {versions.map((version) => (
                  <Message
                    from={message.from}
                    key={`${message.key}-${version.id}`}
                  >
                    <div>
                      {message.sources?.length && (
                        <Sources>
                          <SourcesTrigger count={message.sources.length} />
                          <SourcesContent>
                            {message.sources.map((source) => (
                              <Source
                                href={source.href}
                                key={source.href}
                                title={source.title}
                              />
                            ))}
                          </SourcesContent>
                        </Sources>
                      )}
                      {message.reasoning && (
                        <Reasoning duration={message.reasoning.duration}>
                          <ReasoningTrigger />
                          <ReasoningContent>
                            {message.reasoning.content}
                          </ReasoningContent>
                        </Reasoning>
                      )}
                      <MessageContent>
                        <MessageResponse>{version.content}</MessageResponse>
                      </MessageContent>
                    </div>
                  </Message>
                ))}
              </MessageBranchContent>
              {versions.length > 1 && (
                <MessageBranchSelector>
                  <MessageBranchPrevious />
                  <MessageBranchPage />
                  <MessageBranchNext />
                </MessageBranchSelector>
              )}
            </MessageBranch>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="grid shrink-0 gap-4 pt-4">
        {displayMessages.length === 0 && (
          <Suggestions className="px-4">
            {suggestions.map((suggestion) => (
              <SuggestionItem
                key={suggestion}
                onClick={handleSuggestionClick}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
        )}
        <div className="w-full px-4 pb-4">
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputHeader>
              <PromptInputAttachmentsDisplay />
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea onChange={handleInputChange} value={input} />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <SpeechInput
                  className="shrink-0"
                  onTranscriptionChange={handleTranscriptionChange}
                  size="icon-sm"
                  variant="ghost"
                />
                <PromptInputButton
                  onClick={toggleWebSearch}
                  variant={useWebSearch ? "default" : "ghost"}
                >
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </PromptInputButton>
                <ModelSelector
                  onOpenChange={setModelSelectorOpen}
                  open={modelSelectorOpen}
                >
                  <ModelSelectorTrigger asChild>
                    <PromptInputButton>
                      {selectedModelData?.chefSlug && (
                        <ModelSelectorLogo
                          provider={selectedModelData.chefSlug}
                        />
                      )}
                      {selectedModelData?.name && (
                        <ModelSelectorName>
                          {selectedModelData.name}
                        </ModelSelectorName>
                      )}
                    </PromptInputButton>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                      <ModelSelectorGroup heading="Groq" key="Groq">
                        {models
                          .filter((m) => m.chef === "Groq")
                          .map((m) => (
                            <ModelItem
                              isSelected={model === m.id}
                              key={m.id}
                              m={m}
                              onSelect={handleModelSelect}
                            />
                          ))}
                      </ModelSelectorGroup>
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>
              <PromptInputSubmit disabled={isSubmitDisabled} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};

export default BoardRoom;
