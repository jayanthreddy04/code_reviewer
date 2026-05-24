export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { value: 'typescript', label: 'TypeScript', monaco: 'typescript' },
  { value: 'python', label: 'Python', monaco: 'python' },
  { value: 'java', label: 'Java', monaco: 'java' },
  { value: 'cpp', label: 'C++', monaco: 'cpp' },
  { value: 'go', label: 'Go', monaco: 'go' },
];

export const SAMPLE_CODE = {
  javascript: `function fetchUserData(userId) {
  var password = "admin123";
  console.log("Fetching user:", userId);
  
  if (!userId) return null;
  
  return fetch("/api/users/" + userId)
    .then(res => res.json())
    .catch(err => console.log(err));
}`,
  python: `def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers)

def process_data(data):
    password = "secret123"
    print(data)
    return calculate_average(data)`,
  typescript: `interface User {
  id: string;
  name: string;
}

async function getUser(id: string): Promise<User | null> {
  if (!id) return null;
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}`,
};

export const SEVERITY_COLORS = {
  low: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300',
  medium: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300',
  high: 'text-red-600 bg-red-100 dark:bg-red-900/40 dark:text-red-300',
};
