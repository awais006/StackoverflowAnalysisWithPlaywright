import {test, expect, Browser, Page, Locator} from '@playwright/test'
import { chromium } from 'playwright'
import { searchResult } from '../models/searchResult.type';
import { getQuestionData } from '../utils/pageUtils';

function isSortedDescendingByTimestamp(results: searchResult[]): boolean {
    for (let i = 0; i < results.length - 1; i++) {
        if (results[i].timeStamp < results[i + 1].timeStamp) {
            return false;
        }
    }
    return true;
}

test('stackoverflow test', async()=>{

    const browser:Browser = await chromium.launch({headless: false});
    const page:Page = await browser.newPage();
    await page.goto("https://stackoverflow.com/questions", {
        waitUntil: "domcontentloaded", 
        timeout: 120000, 
      });


    const acceptCookiesButton:Locator = await page.locator("//button[text()='Accept all cookies']");
    await acceptCookiesButton.click();

    const newestTagLink:Locator = await page.locator("//a[@data-nav-value='Newest'");
    const filterButton:Locator = await page.locator("//button//*[name()='svg' and contains(@class, 'iconFilter')]");
    const searchBox:Locator = await page.locator("//div[contains(@class, 'tag-editor')]//input");
    const applyFilterButton:Locator = await page.locator("//button[text() = 'Apply filter']");
    const fiftyRecordsPerPageButton:Locator = await page.locator("//a[text()=50]");
    const secondPageButton:Locator = await page.locator("//a[text()=2]");
    const questions:Locator = await page.locator("//div[contains(@id, 'question-summary')]");

    let searchResultsList: searchResult[] = [];

    await filterButton.click();
    await searchBox.fill("javascript");
    await applyFilterButton.click();

    await fiftyRecordsPerPageButton.click();

    const questionsCount = await questions.count();

    async function getQuestionsData(questions: Locator) {
        const questionsCount = await questions.count();
        for (let i = 0; i < questionsCount; i++) {
            const question = questions.nth(i);
            const data = await getQuestionData(question);
            searchResultsList.push(data);
        }
    }

    await getQuestionsData(questions);

    if (searchResultsList.length < 100) {
        await secondPageButton.click();
        await page.waitForLoadState();

        // Get data from the second page
        await getQuestionsData(questions);
    }
    
    const allContainsTag = searchResultsList.every(result => 
        result.tags.includes('javascript')
    );
    expect(allContainsTag).toBe(true);

    const isSortedByTimeStampDesc = isSortedDescendingByTimestamp(searchResultsList);
    expect(isSortedByTimeStampDesc).toBe(true);

    browser.close();
});