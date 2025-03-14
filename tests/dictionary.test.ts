/// <reference types="jest" />
import * as fs from 'fs';
import * as path from 'path';
import { Dictionary } from '../src/services/dictionary/dictionary.main';

//=-- Mock the file system modules
jest.mock('fs');
jest.mock('path');

/**
 * Tests for Dictionary class
 */
describe('Dictionary', () => {
    let dictionary: Dictionary;
    const mockDictPath: string = '/mock/path/to/dict';
    
    /**
     * Setup before each test
     */
    beforeEach(() => {
        //=-- Reset mocks
        jest.clearAllMocks();
        
        //=-- Setup path.join mock
        (path.join as jest.Mock).mockImplementation((...args: string[]): string => {
            if (args[args.length - 1] === 'dict') {
                return mockDictPath;
            }
            return `${mockDictPath}/${args[args.length - 1]}`;
        });
        
        //=-- Create dictionary instance
        dictionary = new Dictionary();
    });
    
    /**
     * Test getting words from all.txt
     */
    test('should get words from all.txt when no lengths provided', () => {
        //=-- Setup mocks
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue('word1\nword2\nword3\nword4\nword5');
        
        //=-- Execute
        const result: string[] = dictionary.getWords({ count: 3 });
        
        //=-- Verify
        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.readFileSync).toHaveBeenCalled();
        expect(result.length).toBe(3);
    });
    
    /**
     * Test getting words from specific length files
     */
    test('should get words from specific length files', () => {
        //=-- Setup mocks
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock)
            .mockReturnValueOnce('apple\nbanana\ncherry')
            .mockReturnValueOnce('orange\ngrapes\nmelon');
        
        //=-- Execute
        const result: string[] = dictionary.getWords({ count: 4, lengths: [5, 6] });
        
        //=-- Verify
        expect(fs.existsSync).toHaveBeenCalledTimes(2);
        expect(fs.readFileSync).toHaveBeenCalledTimes(2);
        expect(result.length).toBe(4);
    });
    
    /**
     * Test handling non-existent files
     */
    test('should handle non-existent files gracefully', () => {
        //=-- Setup mocks
        (fs.existsSync as jest.Mock).mockReturnValue(false);
        
        //=-- Execute
        const result: string[] = dictionary.getWords({ count: 3, lengths: [999] });
        
        //=-- Verify
        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.readFileSync).not.toHaveBeenCalled();
        expect(result.length).toBe(0);
    });
    
    /**
     * Test error handling
     */
    test('should handle file read errors gracefully', () => {
        //=-- Setup mocks
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockImplementation(() => {
            throw new Error('Mock file read error');
        });
        
        //=-- Execute
        const result: string[] = dictionary.getWords({ count: 3 });
        
        //=-- Verify
        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.readFileSync).toHaveBeenCalled();
        expect(result.length).toBe(0);
    });
});
