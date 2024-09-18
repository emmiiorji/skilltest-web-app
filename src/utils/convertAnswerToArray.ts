export const convertAnswerToArray = <T extends string | number>(answer: string): T[][] | T[] => {
  // Remove whitespace and outer brackets
  const trimmed = answer.trim().replace(/^\[|\]$/g, '');
  
  // Check if it's a nested array
  if (trimmed.includes('[')) {
    // Split nested arrays and parse each
    return trimmed.split(/\]\s*,\s*\[/).map(subArray => 
      subArray.replace(/^\[|\]$/g, '').split(',').map(item => parseItem<T>(item.trim()))
    );
  } else {
    // Parse single array
    return trimmed.split(',').map(item => parseItem<T>(item.trim()));
  }
};

// Helper function to parse individual items
function parseItem<T extends string | number>(item: string): T {
  // Remove quotes for strings
  const unquoted = item.replace(/^['"]|['"]$/g, '');
  return (isNaN(Number(unquoted)) ? unquoted : Number(unquoted)) as T;
}