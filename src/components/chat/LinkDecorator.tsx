export const componentDecorator = (href: string, text: string, key: number) => (
  <a 
    href={href} 
    key={key} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-blue-600 hover:text-blue-800"
  >
    {text}
  </a>
);