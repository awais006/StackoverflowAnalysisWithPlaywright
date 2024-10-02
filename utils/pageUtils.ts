import { Locator } from '@playwright/test';

async function getQuestionData(question: Locator) {
    const title = await question.locator("//h3//a").textContent();
    const tagsCount = await question.locator("//li[contains(@class, 'post-tag')]").count();
    const votes = await question.locator("//div[contains(@title, 'Score of')]//span[contains(@class, '--stats-item-number')]").textContent();
    const timeStamp = await question.locator("//time//span").getAttribute("title");

    const tags: string[] = [];
    for (let j = 0; j < tagsCount; j++) {
        const currentTag = await question.locator("//li[contains(@class, 'post-tag')]").nth(j).textContent();
        tags.push(currentTag!);
    }

    return {
        title: title!,
        tags,
        numberOfVotes: votes!,
        timeStamp: new Date(timeStamp!)
    };
}

export { getQuestionData };