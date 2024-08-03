import os
import sys
import json
import math

FPS = 60

def convert(filename):
    sections = {}
    current_section = None
    columnCount = 0
    approachRate = 0

    with open(filename, 'r', encoding='utf-8') as file:
        for line in file:
            line = line.strip()
            if not line or line.startswith('//'):
                continue
            if line.startswith('[') and line.endswith(']'):
                current_section = line[1:-1]
                sections[current_section] = []
            elif current_section:
                if current_section == 'HitObjects':
                    sections[current_section].append(line.split(','))
                elif current_section == 'Difficulty':
                    if line.startswith('CircleSize'):
                        columnCount = int(line.split(':')[1])
                    elif line.startswith('ApproachRate'):
                        approachRate = float(line.split(':')[1])
                    sections[current_section].append(line)
                else:
                    sections[current_section].append(line)

    frame_duration = 1000 / FPS
    rows = [[] for _ in range(columnCount) ]
    for line in sections['HitObjects']:
        # 0:x, 1:y, 2:time, 3:type, 4:hitsound, 5:extras
        columnIndex = math.floor(float(line[0]) * columnCount / 512)
        if columnIndex >= columnCount:
            columnIndex = columnCount - 1
        frame = math.floor(float(line[2]) / frame_duration)
        rows[columnIndex].append(frame)

    fileData = {'columnCount': columnCount, 'approachRate': approachRate, 'rows': rows}

    with open(f'assets/song/{filename}.json', 'w') as file:
        file.write(json.dumps(fileData, indent=4))

    print(f"assets/song/{filename}.json")

    return sections

def main():
    if len(sys.argv) != 2:
        print('Usage: python convert.py <filename>')
        sys.exit(1)

    filename = sys.argv[1]
    if filename == '-a':
        for filename in os.listdir('.'):
            if filename.endswith('.osu'):
                sections = convert(filename)
    elif not os.path.exists(filename):
        print(f'Error: file "{filename}" not found')
        sys.exit(1)
    else:
        sections = convert(filename)

if __name__ == '__main__':
    main()