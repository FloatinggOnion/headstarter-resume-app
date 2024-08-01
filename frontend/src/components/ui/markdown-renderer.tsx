import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter, SyntaxHighlighterProps } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CSSProperties } from 'react';
// import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';

// SyntaxHighlighter.registerLanguage('tsx', tsx);

// const safeStyle: SyntaxHighlighterProps['style'] = solarizedlight as unknown as SyntaxHighlighterProps['style'];

type PrismStyleType = { [key: string]: CSSProperties } | CSSProperties;

type CustomSyntaxHighlighterProps = Omit<SyntaxHighlighterProps, 'style'> & {
  style: PrismStyleType;
};

const CustomSyntaxHighlighter: React.FC<CustomSyntaxHighlighterProps> = (props) => (
  <SyntaxHighlighter {...props as SyntaxHighlighterProps} />
);

const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        code({className, children, ...props}) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : 'text'
          return (
            <CustomSyntaxHighlighter
              style={solarizedlight}
              language={language}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </CustomSyntaxHighlighter>
          )
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;