Planner Code plan:
```python
def main():
    # 1. Activate web search skill to find the Springer LNCS (ISWC 2025) template details
    activate_skill("web-search-and-scrape")
    
    # 2. Search for Springer LNCS LaTeX template and submission guidelines for ISWC 2025
    web_search(query="Springer LNCS LaTeX template official download ISWC 2025 guidelines")
    
    # 3. Read the content of the research paper markdown file
    paper_content = filesystem_file_read(path="/home/sandbox/GOI_research_paper.md")
    
    # 4. Install necessary LaTeX packages using bash (texlive-latex-base, texlive-latex-extra, etc.)
    bash_run_command(command="sudo apt-get update && sudo apt-get install -y texlive-latex-base texlive-latex-extra texlive-fonts-recommended")
    
    # 5. Create the LaTeX file (.tex) following the LNCS format (documentclass llncs)
    # The script will structure the title, authors, abstract, sections, and bibliography based on the paper content.
    latex_file_path = "/home/sandbox/GOI_research_paper.tex"
    # (The actual content generation will be handled in the execution step using filesystem_file_write)
    
    # 6. Compile the .tex file into a PDF using pdflatex
    # Running it twice to ensure citations and cross-references are resolved.
    bash_run_command(command=f"pdflatex -interaction=nonstopmode -output-directory=/home/sandbox/ {latex_file_path}")
    bash_run_command(command=f"pdflatex -interaction=nonstopmode -output-directory=/home/sandbox/ {latex_file_path}")
    
    # 7. Verify the output PDF exists and notify the user
    bash_run_command(command="ls -l /home/sandbox/GOI_research_paper.pdf")

if __name__ == "__main__":
    main()
```