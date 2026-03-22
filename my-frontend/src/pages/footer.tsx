export default function Footer() {
    return (<>
        <footer className="bg-purple-100 dark:bg-purple-800 text-center py-4 mt-8">
            <div>
                <p>help in finding code snippets. </p>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                    Made with <span className="text-red-500">❤️</span> by CodeVault Team
                </span>
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-400">
                &copy; {new Date().getFullYear()} CodeVault. All rights reserved.
            </p>

        </footer>
    </>)
}