import glob
import datetime
import json

my_name = "Arlan Jaska"

def find_files():
    return glob.iglob("./facebook-*/messages/*/*/message_*.json")

data_store = {}
human_data_store = {}

def process_file(filename):
    with open(filename, 'r') as file:
        parsed = json.load(file)
        
        if parsed["thread_type"] != "Regular":
            return
        
        other_human_name = parsed["title"]
        print(f"Loading {other_human_name}")
        for message in parsed["messages"]:
            if message["sender_name"] != my_name:
                continue
                
            dt = datetime.date.fromtimestamp(message["timestamp_ms"] // 1000)
            isoformat = dt.isoformat()
            date_keyed = data_store.get(isoformat, {})
            score = date_keyed.get(other_human_name, 0)
            date_keyed[other_human_name] = score + 1
            data_store[isoformat] = date_keyed
            
            human_data_store[other_human_name] = human_data_store.get(other_human_name, 0) + 1

for file in find_files():
    process_file(file)



human_to_color = {}
colors_assigned = set()
def assign_colors():
    queue = sorted(human_data_store.items(), key=lambda item: item[1])
    
    current_factor = 1
    values = [0,]
    while len(queue):
        if len(values) == 0:
            values = []
            current_factor = current_factor * 2
            x = 360 / current_factor
            mul = 1
            while x * mul < 360:
                val = int(x * mul)
                if not val in colors_assigned:
                    values.append(val)
                mul += 1
                
        next_item = queue.pop()
        next_value = values.pop()
        
        human_to_color[next_item[0]] = next_value
        colors_assigned.add(next_value)

print("Assigning colors to humans")
assign_colors()

colored_dates = {}
def days_to_colors():
    for day, people in data_store.items():
        print(day)
        print(people.items())
        biggest_person = max(people.items(), key=lambda x: x[1])[0]
        colored_dates[day] = biggest_person
days_to_colors()
colored_dates = {k: human_to_color[v] for k, v in sorted(colored_dates.items(), key=lambda item: item[0])}
print(colored_dates)

with open('data.json', 'w') as f:
    json.dump(colored_dates, f)
    
with open('key.json', 'w') as f:
    json.dump(human_to_color, f)
