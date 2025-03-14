import * as fs from 'fs';
import * as path from 'path';

//=-- Interface for the dictionary options
interface DictionaryOptions {
    count: number;
    lengths?: number[];
}

//=-- Class for handling dictionary operations
export class Dictionary {
    /**
     * Path to the dictionary files
     */
    private readonly DICT_PATH: string = path.join(__dirname, 'dict');

    /**
     * Get random words from the dictionary
     * @param options - Options for retrieving words
     * @returns Array of words
     */
    public getWords(options: DictionaryOptions): string[] {
        const { count, lengths } = options;
        
        //=-- If no lengths are provided, use all.txt
        if (!lengths || lengths.length === 0) {
            return this.getWordsFromFile('all.txt', count);
        }
        
        //=-- Get words from each specified length file
        const wordsPerLength: number = Math.ceil(count / lengths.length);
        let result: string[] = [];
        
        for (const length of lengths) {
            const filename: string = `${length}.txt`;
            const words: string[] = this.getWordsFromFile(filename, wordsPerLength);
            result = result.concat(words);
        }
        
        //=-- Shuffle and trim to the requested count
        return this.shuffleArray(result).slice(0, count);
    }
    
    /**
     * Get words from a specific dictionary file
     * @param filename - Name of the dictionary file
     * @param count - Number of words to retrieve
     * @returns Array of words
     */
    private getWordsFromFile(filename: string, count: number): string[] {
        try {
            const filePath: string = path.join(this.DICT_PATH, filename);
            
            //=-- Check if file exists
            if (!fs.existsSync(filePath)) {
                console.error(`Dictionary file not found: ${filename}`);
                return [];
            }
            
            //=-- Read and parse the file
            const fileContent: string = fs.readFileSync(filePath, 'utf-8');
            const words: string[] = fileContent.split('\n')
                .map(word => word.trim())
                .filter(word => word.length > 0);
            
            //=-- Return random selection of words
            return this.getRandomElements(words, count);
        } catch (error) {
            console.error(`Error reading dictionary file ${filename}:`, error);
            return [];
        }
    }
    
    /**
     * Get random elements from an array
     * @param array - Source array
     * @param count - Number of elements to retrieve
     * @returns Array of random elements
     */
    private getRandomElements<T>(array: T[], count: number): T[] {
        const shuffled: T[] = this.shuffleArray([...array]);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
    
    /**
     * Shuffle an array using Fisher-Yates algorithm
     * @param array - Array to shuffle
     * @returns Shuffled array
     */
    private shuffleArray<T>(array: T[]): T[] {
        const result: T[] = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j: number = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
}