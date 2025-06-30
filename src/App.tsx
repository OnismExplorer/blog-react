import {ThemeProvider} from "next-themes";
import AppContent from "./AppContent";

function App() {
    return (
        <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            storageKey="theme"
        >
            <AppContent />
        </ThemeProvider>
    );
}

export default App;
