# Bedtime Books 📚✨

A magical AI-powered children's book generator that creates personalized bedtime stories with beautiful illustrations.

## ✨ Features

- **Personalized Stories**: Create stories featuring your child as the main character
- **AI-Generated Illustrations**: Beautiful, consistent artwork using OpenAI DALL-E 3
- **PDF Export**: Download complete storybooks as PDFs
- **Multiple Art Styles**: Choose from 7 different illustration styles
- **Topic Suggestions**: Quick-start with popular themes like kindness, friendship, and adventure
- **Age-Appropriate Content**: Tailored for children ages 3-10

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rrmaustin/bedtime-books.git
cd bedtime-books
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎨 How It Works

1. **Story Generation**: Enter your child's details and choose a topic
2. **AI Story Creation**: GPT-4 generates a personalized story with 8-12 pages
3. **Image Generation**: DALL-E 3 creates consistent illustrations for each page
4. **PDF Export**: Download the complete storybook as a beautiful PDF

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4 (story generation), DALL-E 3 (illustrations)
- **PDF Generation**: PDFKit
- **Form Handling**: React Hook Form
- **Validation**: Zod

## 📝 Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key_here
MOCK_IMAGES=false  # Set to true for development/testing
```

## 🚀 Deployment

The app is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

Made with ❤️ for bedtime stories everywhere
