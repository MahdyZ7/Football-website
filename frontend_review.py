#!/usr/bin/env python3
"""
Comprehensive Frontend Review Script for Football-website
Tests all pages, captures screenshots, and identifies improvement opportunities
"""

from playwright.sync_api import sync_playwright
import json
from datetime import datetime

def review_frontend():
    results = {
        'timestamp': datetime.now().isoformat(),
        'pages_tested': [],
        'issues_found': [],
        'console_errors': [],
        'network_issues': [],
        'screenshots': []
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Capture console messages
        console_messages = []
        page.on('console', lambda msg: console_messages.append({
            'type': msg.type,
            'text': msg.text
        }))

        # Capture network errors
        network_errors = []
        page.on('requestfailed', lambda request: network_errors.append({
            'url': request.url,
            'failure': request.failure
        }))

        # List of pages to test
        pages_to_test = [
            {'name': 'Homepage (Registration)', 'url': 'http://localhost:3000/', 'path': '/tmp/homepage.png'},
            {'name': 'Teams Page', 'url': 'http://localhost:3000/teams', 'path': '/tmp/teams.png'},
            {'name': 'Roster Page', 'url': 'http://localhost:3000/roster', 'path': '/tmp/roster.png'},
            {'name': 'Rules Page', 'url': 'http://localhost:3000/rules', 'path': '/tmp/rules.png'},
            {'name': 'Feedback Page', 'url': 'http://localhost:3000/feedback', 'path': '/tmp/feedback.png'},
            {'name': 'Banned Players', 'url': 'http://localhost:3000/banned-players', 'path': '/tmp/banned.png'},
            {'name': 'Admin Page', 'url': 'http://localhost:3000/admin', 'path': '/tmp/admin.png'},
            {'name': 'Admin Logs', 'url': 'http://localhost:3000/admin-logs', 'path': '/tmp/admin-logs.png'},
        ]

        for page_info in pages_to_test:
            print(f"\n{'='*60}")
            print(f"Testing: {page_info['name']}")
            print(f"URL: {page_info['url']}")
            print(f"{'='*60}")

            try:
                # Clear console messages for this page
                console_messages.clear()
                network_errors.clear()

                # Navigate and wait for page to load
                page.goto(page_info['url'], wait_until='networkidle', timeout=30000)

                # Wait a bit for any delayed scripts
                page.wait_for_timeout(2000)

                # Take full page screenshot
                page.screenshot(path=page_info['path'], full_page=True)
                print(f"✓ Screenshot saved: {page_info['path']}")

                # Get page title
                title = page.title()
                print(f"✓ Page Title: {title}")

                # Check for common UI elements
                has_navbar = page.locator('nav').count() > 0
                has_footer = page.locator('footer').count() > 0
                print(f"✓ Navbar: {'Yes' if has_navbar else 'No'}")
                print(f"✓ Footer: {'Yes' if has_footer else 'No'}")

                # Count buttons, links, forms
                button_count = page.locator('button').count()
                link_count = page.locator('a').count()
                form_count = page.locator('form').count()
                input_count = page.locator('input').count()

                print(f"✓ Buttons: {button_count}")
                print(f"✓ Links: {link_count}")
                print(f"✓ Forms: {form_count}")
                print(f"✓ Inputs: {input_count}")

                # Check for loading states
                loading_elements = page.locator('[class*="skeleton"], [class*="loading"], [class*="spinner"]').count()
                print(f"✓ Loading elements: {loading_elements}")

                # Store page info
                page_result = {
                    'name': page_info['name'],
                    'url': page_info['url'],
                    'title': title,
                    'screenshot': page_info['path'],
                    'has_navbar': has_navbar,
                    'has_footer': has_footer,
                    'button_count': button_count,
                    'link_count': link_count,
                    'form_count': form_count,
                    'input_count': input_count,
                    'console_messages': console_messages.copy(),
                    'network_errors': network_errors.copy()
                }

                results['pages_tested'].append(page_result)
                results['screenshots'].append(page_info['path'])

                # Check for errors
                error_messages = [msg for msg in console_messages if msg['type'] == 'error']
                warning_messages = [msg for msg in console_messages if msg['type'] == 'warning']

                if error_messages:
                    print(f"⚠ Console Errors: {len(error_messages)}")
                    for err in error_messages:
                        print(f"  - {err['text']}")
                        results['console_errors'].append({
                            'page': page_info['name'],
                            'error': err['text']
                        })

                if warning_messages:
                    print(f"⚠ Console Warnings: {len(warning_messages)}")

                if network_errors:
                    print(f"⚠ Network Errors: {len(network_errors)}")
                    for err in network_errors:
                        print(f"  - {err['url']}")
                        results['network_issues'].append({
                            'page': page_info['name'],
                            'url': err['url']
                        })

            except Exception as e:
                print(f"✗ Error testing page: {str(e)}")
                results['issues_found'].append({
                    'page': page_info['name'],
                    'error': str(e)
                })

        # Test mobile responsiveness on key pages
        print(f"\n{'='*60}")
        print("Testing Mobile Responsiveness")
        print(f"{'='*60}")

        mobile_context = browser.new_context(viewport={'width': 375, 'height': 667})
        mobile_page = mobile_context.new_page()

        mobile_pages = [
            {'name': 'Homepage Mobile', 'url': 'http://localhost:3000/', 'path': '/tmp/homepage-mobile.png'},
            {'name': 'Teams Mobile', 'url': 'http://localhost:3000/teams', 'path': '/tmp/teams-mobile.png'},
            {'name': 'Feedback Mobile', 'url': 'http://localhost:3000/feedback', 'path': '/tmp/feedback-mobile.png'},
        ]

        for page_info in mobile_pages:
            try:
                mobile_page.goto(page_info['url'], wait_until='networkidle', timeout=30000)
                mobile_page.wait_for_timeout(1000)
                mobile_page.screenshot(path=page_info['path'], full_page=True)
                print(f"✓ Mobile screenshot: {page_info['path']}")
                results['screenshots'].append(page_info['path'])
            except Exception as e:
                print(f"✗ Error: {str(e)}")

        mobile_page.close()
        mobile_context.close()
        browser.close()

    # Save results to JSON
    with open('/tmp/frontend_review_results.json', 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\n{'='*60}")
    print("Review Complete!")
    print(f"{'='*60}")
    print(f"Pages tested: {len(results['pages_tested'])}")
    print(f"Screenshots captured: {len(results['screenshots'])}")
    print(f"Console errors found: {len(results['console_errors'])}")
    print(f"Network issues found: {len(results['network_issues'])}")
    print(f"\nResults saved to: /tmp/frontend_review_results.json")

    return results

if __name__ == '__main__':
    review_frontend()
