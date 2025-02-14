# Jeopardy Trivia Game

A web-based Jeopardy-style trivia game built with React and Node.js. Test your knowledge with real Jeopardy questions across various categories!

## Features

- Real Jeopardy questions from the show's history
- Question-style answer format ("What is..." / "Who is...")
- Score tracking
- Performance insights by category
- Clean, Jeopardy-themed UI
- Mobile-responsive design

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Axios for API calls

### Backend
- Node.js
- Express
- JSON data store

## Getting Started

### Live Demo
Try the game at: [https://jeopardy-trivia.vercel.app](https://jeopardy-trivia.vercel.app)

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository

bash
git clone https://github.com/rverma6/jeopardy-trivia.git
cd jeopardy-trivia

2. Install dependencies

bash
npm install

Install frontend dependencies
cd ../frontend
npm install


3. Start the development servers

Start backend server
cd ../backend
npm start

Start frontend server
cd ../frontend

## How to Play

1. Each question is presented with its category and dollar value
2. Type your answer in the format "What is [answer]" or "Who is [answer]"
3. Submit your answer to see if you're correct
4. Track your score and performance insights
5. Try to improve your knowledge in different categories!

## Game Rules

- Answers must be phrased as questions (e.g., "What is..." or "Who is...")
- Spelling is somewhat flexible for longer answers
- Articles (a, an, the) are optional
- Question marks are optional

## Development

### Project Structure

```
jeopardy-trivia/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
├── server/
│   ├── routes/
│   ├── data/
│   └── app.js
└── README.md
```

### Available Scripts

Frontend:
- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production

Backend:
- `npm start` - Starts the server
- `npm run dev` - Runs the server with nodemon for development

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Jeopardy! is a registered trademark of Jeopardy Productions, Inc.
- Question data sourced from [j-archive](http://j-archive.com/)
- Built with inspiration from the classic TV show format

## Contact

Rayva Verma - [@vermray](https://twitter.com/vermray)

Project Link: [https://github.com/rverma6/jeopardy-trivia](https://github.com/rverma6/jeopardy-trivia)
